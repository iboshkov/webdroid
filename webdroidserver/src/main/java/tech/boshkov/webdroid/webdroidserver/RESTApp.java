package tech.boshkov.webdroid.webdroidserver;

import fi.iki.elonen.NanoHTTPD;
import tech.boshkov.webdroid.server.annotations.RequestHandler;
import tech.boshkov.webdroid.server.interfaces.Controller;

/**
 * Created by mindc on 5/11/2017.
 */

public class RESTApp implements Controller {

    @RequestHandler(route = "/rest/status")
    public NanoHTTPD.Response getPhoneStatus() {

        return null;
    }

    @Override
    public String id() {
        return null;
    }
}
