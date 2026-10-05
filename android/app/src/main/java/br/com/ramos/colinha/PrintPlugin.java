package br.com.ramos.colinha;

import android.content.Context;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.webkit.WebView;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Abre o gerenciador de impressão do Android (PrintManager) com o conteúdo atual da WebView.
 * window.print() não faz nada na WebView do Android, por isso este plugin.
 */
@CapacitorPlugin(name = "Print")
public class PrintPlugin extends Plugin {

    @PluginMethod
    public void print(final PluginCall call) {
        final String jobName = call.getString("name", "Colinha Eleitoral");
        getActivity().runOnUiThread(() -> {
            try {
                PrintManager pm = (PrintManager) getActivity().getSystemService(Context.PRINT_SERVICE);
                WebView webView = getBridge().getWebView();
                PrintDocumentAdapter adapter = webView.createPrintDocumentAdapter(jobName);
                pm.print(jobName, adapter, new PrintAttributes.Builder()
                        .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                        .setMinMargins(new PrintAttributes.Margins(394, 394, 394, 394)) // ~10 mm (milésimos de polegada)
                        .build());
                call.resolve(new JSObject());
            } catch (Exception e) {
                call.reject("Falha ao abrir a impressão: " + e.getMessage());
            }
        });
    }
}
