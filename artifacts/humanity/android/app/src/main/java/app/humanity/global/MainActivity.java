package app.humanity.global;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(NativeClerkPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
