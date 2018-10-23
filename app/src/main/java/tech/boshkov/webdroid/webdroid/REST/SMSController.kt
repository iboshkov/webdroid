package tech.boshkov.webdroid.webdroid.REST

import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import android.os.Environment
import com.github.salomonbrys.kotson.fromJson
import com.github.salomonbrys.kotson.jsonArray
import com.github.salomonbrys.kotson.jsonObject
import com.github.salomonbrys.kotson.set
import com.google.gson.Gson
import com.google.gson.JsonObject
import fi.iki.elonen.NanoHTTPD
import org.apache.commons.fileupload.disk.DiskFileItemFactory
import org.zeroturnaround.zip.ZipUtil
import org.zeroturnaround.zip.commons.IOUtils
import tech.boshkov.webdroid.server.NanoFileUpload
import tech.boshkov.webdroid.server.WebServer
import tech.boshkov.webdroid.server.annotations.RequestHandler
import tech.boshkov.webdroid.server.interfaces.WebApplication
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.IOException
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream
import me.everything.providers.android.telephony.Conversation;
import me.everything.providers.android.telephony.Sms
import me.everything.providers.android.telephony.TelephonyProvider;
import me.everything.providers.core.Data;
import tech.boshkov.webdroid.server.UrlMatch

/**
 * Created by iboshkov on 5/17/2017.
 */
class SMSController(private val mContext: Context, private val server: WebServer) : WebApplication {
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