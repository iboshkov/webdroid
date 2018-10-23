package tech.boshkov.webdroid.webdroid

import android.Manifest
import android.support.v4.app.ActivityCompat
import android.support.v4.content.ContextCompat
import android.support.v7.app.AppCompatActivity
import android.os.Bundle

import tech.boshkov.webdroid.server.*
import android.content.pm.PackageManager
import kotlinx.android.synthetic.main.activity_main.*
import tech.boshkov.webdroid.webdroid.REST.RESTApp
import tech.boshkov.webdroid.webdroid.REST.SMSController
import java.io.*


class MainActivity : AppCompatActivity() {
    internal lateinit var mServer: WebServer
    internal lateinit var mRest: RESTApp

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val permissionList =  arrayOf(Manifest.permission.WRITE_EXTERNAL_STORAGE,
                Manifest.permission.READ_EXTERNAL_STORAGE,
                Manifest.permission.ACCESS_NETWORK_STATE,
                Manifest.permission.ACCESS_WIFI_STATE,
                Manifest.permission.READ_SMS,
                Manifest.permission.SEND_SMS,
                Manifest.permission.INTERNET);
        for (permission in permissionList) {
            val permissionCheck = ContextCompat.checkSelfPermission(this, permission);
            if (permissionCheck == PackageManager.PERMISSION_DENIED) {
                ActivityCompat.requestPermissions(this, permissionList, 0);
                return;
            }
        }

        this.init()
    }

    fun init() {
        try {
            mServer = WebServer(this, 3000)
            mRest = RESTApp(this, mServer)
            mServer.registerApplication(mRest)
            mServer.registerApplication(SMSController(this, mServer))
            mServer.start()
            val ip = getLocalIpAddress()
            txtIp.text = "Open your browser to: http://$ip:3000"
        } catch (e: IOException) {
            e.printStackTrace()
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        if (grantResults.contains(PackageManager.PERMISSION_DENIED)) {
            finish();
        } else {
            this.init();
        }
    }
}
