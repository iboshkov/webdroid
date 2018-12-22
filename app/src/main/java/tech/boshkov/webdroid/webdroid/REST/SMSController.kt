package tech.boshkov.webdroid.webdroid.REST

import android.content.Context
import com.github.salomonbrys.kotson.jsonArray
import com.github.salomonbrys.kotson.jsonObject
import com.google.gson.JsonObject
import fi.iki.elonen.NanoHTTPD
import tech.boshkov.webdroid.server.WebServer
import tech.boshkov.webdroid.server.annotations.RequestHandler
import tech.boshkov.webdroid.server.interfaces.Controller
import me.everything.providers.android.telephony.Sms
import me.everything.providers.android.telephony.TelephonyProvider;
import tech.boshkov.webdroid.server.UrlMatch

/**
 * Created by iboshkov on 5/17/2017.
 */
class SMSController(private val mContext: Context, private val server: WebServer) : Controller {
    @RequestHandler(route = "/rest/conversations/")
    fun getConversations(sess: NanoHTTPD.IHTTPSession, urlParams: UrlMatch): NanoHTTPD.Response? {
        val telephonyProvider = TelephonyProvider(mContext)
        try {
            val conversations = telephonyProvider.conversations
            val jsonConvos = conversations.list.map { conv ->
                jsonObject(
                        "snippet" to conv.snippet,
                        "messageCount" to conv.messageCount,
                        "threadId" to conv.threadId
                )
            }
            val response = jsonObject(
                    "conversations" to jsonArray(jsonConvos)
            )

            return NanoHTTPD.newFixedLengthResponse(response.toString())

        } catch (ex: Exception) {
            return NanoHTTPD.newFixedLengthResponse(ex.toString())
        }
    }

    @RequestHandler(route = "/rest/threads/")
    fun getThreads(sess: NanoHTTPD.IHTTPSession, urlParams: UrlMatch): NanoHTTPD.Response? {
        val telephonyProvider = TelephonyProvider(mContext)
        try {
            val threads = telephonyProvider.threads
            val jsonThreads = threads.list.map { conv ->
                jsonObject(
                        "id" to conv.id,
                        "snippet" to conv.snippet,
                        "recipientIds" to jsonArray(conv.recipientIds),
                        "hasAttachment" to conv.hasAttachment,
                        "error" to conv.error,
                        "createdDate" to conv.createdDate,
                        "messageCount" to conv.messageCount,
                        "type" to conv.type?.toString(),
                        "read" to conv.read
                )
            }

            return NanoHTTPD.newFixedLengthResponse(jsonThreads.toString())

        } catch (ex: Exception) {
            return NanoHTTPD.newFixedLengthResponse(ex.toString())
        }
    }

    fun smsToJson(s: Sms, isSent: Boolean): JsonObject {
        return jsonObject(
                "address" to s.address,
                "subject" to s.subject,
                "body" to s.body,
                "person" to s.person,
                "threadId" to s.threadId,
                "receivedDate" to s.receivedDate,
                "sentDate" to s.sentDate,
                "errorCode" to s.errorCode,
                "protocol" to s.protocol,
                "locked" to s.locked,
                "seen" to s.seen,
                "read" to s.read,
                "status" to s.status.toString(),
                "id" to s.id,
                "isSent" to isSent
        )
    }

    @RequestHandler(route = "/rest/conversations/{threadId}")
    fun getThread(sess: NanoHTTPD.IHTTPSession, urlParams: UrlMatch): NanoHTTPD.Response? {
        val telephonyProvider = TelephonyProvider(mContext)
        val threadId = urlParams.get("threadId").toInt()

        try {
            val inbox = telephonyProvider.getSms(TelephonyProvider.Filter.INBOX).list
                    .filter { s -> s.threadId == threadId }.sortedBy { s -> s.receivedDate }
            val sent = telephonyProvider.getSms(TelephonyProvider.Filter.SENT).list
                    .filter { s -> s.threadId == threadId }.sortedBy { s -> s.receivedDate }
            val inboxMessages = inbox.map { s -> smsToJson(s,false) }
            val sentMessages = sent.map { s -> smsToJson(s,true) }

            val response = jsonObject(
                    "messages" to jsonArray(inboxMessages + sentMessages)
            )

            return NanoHTTPD.newFixedLengthResponse(response.toString())

        } catch (ex: Exception) {
            return NanoHTTPD.newFixedLengthResponse(ex.toString())
        }
    }

    override fun id(): String {
        return "WebDroid.SMS"
    }
}