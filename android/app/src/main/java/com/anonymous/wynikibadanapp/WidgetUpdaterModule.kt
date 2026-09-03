package com.anonymous.wynikibadanapp

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class WidgetUpdaterModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "WidgetUpdater"
    }

    @ReactMethod
    fun updateWidgets(paramsJson: String?, resultsJson: String?) {
        val context = reactApplicationContext

        // Store directly into SharedPreferences for 100% reliable instant access by widgets
        val prefs = context.getSharedPreferences("WynikiBadanWidgets", Context.MODE_PRIVATE)
        val editor = prefs.edit()
        if (paramsJson != null) {
            editor.putString("params", paramsJson)
        }
        if (resultsJson != null) {
            editor.putString("results", resultsJson)
        }
        editor.apply()

        sendUpdateBroadcasts(context)
    }

    @ReactMethod
    fun triggerUpdate() {
        val context = reactApplicationContext
        sendUpdateBroadcasts(context)
    }

    private fun sendUpdateBroadcasts(context: Context) {
        // Update CompactListWidget
        val intentCompact = Intent(context, CompactListWidgetProvider::class.java).apply {
            action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
        }
        val idsCompact = AppWidgetManager.getInstance(context).getAppWidgetIds(
            ComponentName(context, CompactListWidgetProvider::class.java)
        )
        if (idsCompact != null && idsCompact.isNotEmpty()) {
            intentCompact.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, idsCompact)
            context.sendBroadcast(intentCompact)
        }
    }
}
