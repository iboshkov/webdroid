package tech.boshkov.webdroid.webdroid.REST

import fi.iki.elonen.NanoHTTPD
import tech.boshkov.webdroid.server.UrlMatch
import tech.boshkov.webdroid.server.annotations.RequestHandler
import tech.boshkov.webdroid.server.interfaces.Controller

class HelloWorld() : Controller {
    @RequestHandler(route = "/hello/world/")
    fun helloWorld(sess: NanoHTTPD.IHTTPSession, urlParams: UrlMatch): NanoHTTPD.Response? {
        return NanoHTTPD.newFixedLengthResponse("Hello World")
    }

    override fun id(): String {
        return "WebDroid.SMS"
    }
}


