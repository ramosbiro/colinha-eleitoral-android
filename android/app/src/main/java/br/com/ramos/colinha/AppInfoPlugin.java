package br.com.ramos.colinha;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.activity.result.ActivityResult;
import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * Informações do app e atualização interna (apenas distribuição direta):
 * o usuário escolhe o APK novo, o app confere pacote/versão e abre o instalador do Android.
 */
@CapacitorPlugin(name = "AppInfo")
public class AppInfoPlugin extends Plugin {

    private static final String PERM_INSTALL = "android.permission.REQUEST_INSTALL_PACKAGES";
    private File apkEscolhido;

    private long codigoVersao(PackageInfo pi) {
        return Build.VERSION.SDK_INT >= 28 ? pi.getLongVersionCode() : pi.versionCode;
    }

    private boolean atualizacaoInternaDisponivel() {
        try {
            PackageInfo pi = getContext().getPackageManager()
                    .getPackageInfo(getContext().getPackageName(), PackageManager.GET_PERMISSIONS);
            if (pi.requestedPermissions == null) return false;
            for (String p : pi.requestedPermissions) if (PERM_INSTALL.equals(p)) return true;
        } catch (Exception ignored) { }
        return false;
    }

    @PluginMethod
    public void getInfo(PluginCall call) {
        try {
            PackageInfo pi = getContext().getPackageManager().getPackageInfo(getContext().getPackageName(), 0);
            JSObject r = new JSObject();
            r.put("versionName", pi.versionName);
            r.put("versionCode", codigoVersao(pi));
            r.put("packageName", getContext().getPackageName());
            r.put("androidVersion", Build.VERSION.RELEASE);
            r.put("sdk", Build.VERSION.SDK_INT);
            r.put("device", Build.MANUFACTURER + " " + Build.MODEL);
            r.put("updateEnabled", atualizacaoInternaDisponivel());
            call.resolve(r);
        } catch (Exception e) {
            call.reject("Não foi possível ler as informações do app: " + e.getMessage());
        }
    }

    /** Abre o seletor de arquivos do Android para escolher o APK. */
    @PluginMethod
    public void pickApk(PluginCall call) {
        if (!atualizacaoInternaDisponivel()) {
            call.reject("Atualização interna indisponível nesta versão do app.");
            return;
        }
        Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        i.addCategory(Intent.CATEGORY_OPENABLE);
        i.setType("*/*");
        i.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{
                "application/vnd.android.package-archive", "application/octet-stream"});
        startActivityForResult(call, i, "aoEscolherApk");
    }

    @ActivityCallback
    private void aoEscolherApk(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null || result.getData().getData() == null) {
            call.reject("cancelado");
            return;
        }
        try {
            Uri uri = result.getData().getData();
            File dir = new File(getContext().getCacheDir(), "update");
            if (!dir.exists()) dir.mkdirs();
            File dest = new File(dir, "update.apk");
            try (InputStream in = getContext().getContentResolver().openInputStream(uri);
                 OutputStream out = new FileOutputStream(dest)) {
                byte[] buf = new byte[64 * 1024];
                int n;
                while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
            }
            PackageInfo novo = getContext().getPackageManager().getPackageArchiveInfo(dest.getAbsolutePath(), 0);
            if (novo == null) {
                dest.delete();
                call.reject("O arquivo escolhido não é um APK válido.");
                return;
            }
            PackageInfo atual = getContext().getPackageManager().getPackageInfo(getContext().getPackageName(), 0);
            apkEscolhido = dest;
            JSObject r = new JSObject();
            r.put("packageName", novo.packageName);
            r.put("versionName", novo.versionName);
            r.put("versionCode", codigoVersao(novo));
            r.put("mesmoPacote", getContext().getPackageName().equals(novo.packageName));
            r.put("atualVersionCode", codigoVersao(atual));
            call.resolve(r);
        } catch (Exception e) {
            call.reject("Falha ao ler o APK: " + e.getMessage());
        }
    }

    /** Abre o instalador do Android com o APK escolhido (pede a permissão "instalar apps desconhecidos" se faltar). */
    @PluginMethod
    public void installApk(PluginCall call) {
        if (!atualizacaoInternaDisponivel() || apkEscolhido == null || !apkEscolhido.exists()) {
            call.reject("Nenhum APK selecionado.");
            return;
        }
        if (Build.VERSION.SDK_INT >= 26 && !getContext().getPackageManager().canRequestPackageInstalls()) {
            Intent s = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                    Uri.parse("package:" + getContext().getPackageName()));
            getActivity().startActivity(s);
            JSObject r = new JSObject();
            r.put("precisaPermissao", true);
            call.resolve(r);
            return;
        }
        try {
            Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", apkEscolhido);
            Intent i = new Intent(Intent.ACTION_VIEW);
            i.setDataAndType(uri, "application/vnd.android.package-archive");
            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            getActivity().startActivity(i);
            JSObject r = new JSObject();
            r.put("precisaPermissao", false);
            call.resolve(r);
        } catch (Exception e) {
            call.reject("Falha ao abrir o instalador: " + e.getMessage());
        }
    }
}
