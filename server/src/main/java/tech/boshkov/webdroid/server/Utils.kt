package tech.boshkov.webdroid.server

import java.net.Inet4Address
import java.net.NetworkInterface
import java.net.NetworkInterface.getNetworkInterfaces
import java.net.SocketException


/**
 * Created by iboshkov on 5/17/2017.
 */
fun getLocalIpAddress(): String? {
    try {
        val en = NetworkInterface.getNetworkInterfaces()
        while (en.hasMoreElements()) {
            val intf = en.nextElement()
            val enumIpAddr = intf.getInetAddresses()
            while (enumIpAddr.hasMoreElements()) {
                val inetAddress = enumIpAddr.nextElement()
                if (!inetAddress.isLoopbackAddress() && inetAddress is Inet4Address) {
                    return inetAddress.getHostAddress()
                }
            }
        }
    } catch (ex: SocketException) {
        ex.printStackTrace()
    }

    return null
}