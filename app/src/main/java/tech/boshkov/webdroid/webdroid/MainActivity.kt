package tech.boshkov.webdroid.webdroid

import android.Manifest
import android.support.v4.app.ActivityCompat
import android.support.v4.content.ContextCompat
import android.support.v7.app.AppCompatActivity
import android.os.Bundle
import android.util.Log

import com.mitchellbosecke.pebble.PebbleEngine
import com.mitchellbosecke.pebble.error.PebbleException
import com.mitchellbosecke.pebble.loader.StringLoader
import com.mitchellbosecke.pebble.template.PebbleTemplate

import java.io.IOException
import java.io.StringWriter
import java.io.Writer
import java.util.HashMap

import fi.iki.elonen.NanoHTTPD
import tech.boshkov.webdroid.server.*
import tech.boshkov.webdroid.server.annotations.RequestHandler
import tech.boshkov.webdroid.server.interfaces.WebApplication
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import com.github.salomonbrys.kotson.*
import com.google.gson.JsonObject


class MainActivity : AppCompatActivity(), WebApplication {
    internal lateinit var server: WebServer
    internal lateinit var batteryStatus : Intent
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        val permissionCheck = ContextCompat.checkSelfPermission(this,
                Manifest.permission.WRITE_EXTERNAL_STORAGE)

        ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.WRITE_EXTERNAL_STORAGE), 0)
        try {
            server = WebServer(this, 3000)
            server.registerApplication(this)
            server.start()

        } catch (e: IOException) {
            e.printStackTrace()
        }

    }

    @RequestHandler(route = "/rest/phone/status")
    fun testRequest(sess: NanoHTTPD.IHTTPSession): NanoHTTPD.Response {
        // Are we charging / charged?
        val ifilter = IntentFilter(Intent.ACTION_BATTERY_CHANGED)
        batteryStatus = this.registerReceiver(null, ifilter)

        val status = batteryStatus.getIntExtra(BatteryManager.EXTRA_STATUS, -1)

        val isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING || status == BatteryManager.BATTERY_STATUS_FULL
        val chargePlug = batteryStatus.getIntExtra(BatteryManager.EXTRA_PLUGGED, -1)
        val usbCharge = chargePlug == BatteryManager.BATTERY_PLUGGED_USB
        val acCharge = chargePlug == BatteryManager.BATTERY_PLUGGED_AC
        val level = batteryStatus.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
        val scale = batteryStatus.getIntExtra(BatteryManager.EXTRA_SCALE, -1)

        val batteryPct = level / scale.toFloat()

        val obj: JsonObject = jsonObject(
                "charging" to chargePlug,
                "chargeMode" to (if (usbCharge) "usb" else (if (chargePlug == 1) "ac" else "discharging")),
                "level" to level,
                "scale" to scale,
                "percent" to batteryPct
        )

        return NanoHTTPD.newFixedLengthResponse(obj.toString())
    }

    @RequestHandler(route = "/rest/phone/info")
    fun phoneInfo(sess: NanoHTTPD.IHTTPSession): NanoHTTPD.Response {
        // Are we charging / charged?
        var name = android.os.Build.MODEL;

        val obj: JsonObject = jsonObject(
                "model" to android.os.Build.MODEL,
                "brand" to android.os.Build.BRAND,
                "device" to android.os.Build.DEVICE,
                "manufacturer" to android.os.Build.MANUFACTURER,
                "product" to android.os.Build.PRODUCT,
                "host" to android.os.Build.HOST,
                "os" to jsonObject(
                    "base_os" to android.os.Build.VERSION.BASE_OS,
                    "release" to android.os.Build.VERSION.RELEASE,
                    "incremental" to android.os.Build.VERSION.INCREMENTAL,
                    "codename" to android.os.Build.VERSION.CODENAME
                )
        )

        var response = NanoHTTPD.newFixedLengthResponse(obj.toString())
        response.mimeType = "application/json";
        return response;
    }

    override fun id(): String {
        return "WebDroid"
    }
}
