package app.totland.kids;

import android.graphics.Color;
import android.os.Bundle;
import androidx.activity.EdgeToEdge;
import androidx.activity.SystemBarStyle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    /** App cream (#fff7ed); light bar style = dark status/nav icons. */
    private static final int CREAM = Color.parseColor("#fff7ed");

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Opt into edge-to-edge on every Android version (not just forced on 15+).
        // Capacitor's adjustMarginsForEdgeToEdge keeps the web view inside the bars.
        EdgeToEdge.enable(this, SystemBarStyle.light(CREAM, CREAM), SystemBarStyle.light(CREAM, CREAM));
        super.onCreate(savedInstanceState);
    }
}
