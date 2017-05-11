package tech.boshkov.webdroid.webdroid;

import android.Manifest;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;

import com.mitchellbosecke.pebble.PebbleEngine;
import com.mitchellbosecke.pebble.error.PebbleException;
import com.mitchellbosecke.pebble.loader.StringLoader;
import com.mitchellbosecke.pebble.template.PebbleTemplate;

import java.io.IOException;
import java.io.StringWriter;
import java.io.Writer;
import java.util.HashMap;
import java.util.Map;

import tech.boshkov.webdroid.server.*;
import tech.boshkov.webdroid.server.annotations.RequestHandler;
import tech.boshkov.webdroid.server.interfaces.WebApplication;

public class MainActivity extends AppCompatActivity implements WebApplication {
    WebServer server;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        int permissionCheck = ContextCompat.checkSelfPermission(this,
                Manifest.permission.WRITE_EXTERNAL_STORAGE);

        ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE}, 0);
        try {
            server = new WebServer(this, 3000);
            server.registerApplication(this);
            server.start();

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @RequestHandler(route = "/test")
    public String testRequest() {
        return "TEST";
    }

    @Override
    public String id() {
        return "WebDroid";
    }
}
