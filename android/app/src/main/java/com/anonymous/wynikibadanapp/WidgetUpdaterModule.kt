package com.anonymous.wynikibadanapp

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class WidgetUpdaterModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "WidgetUpdater"
    }

    @ReactMethod
    fun updateWidgets() {
        val context = reactApplicationContext
        
        // Update CompactListWidget
        val intentCompact = Intent(context, CompactListWidgetProvider::class.java).apply {
            action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
        }
        val idsCompact = AppWidgetManager.getInstance(context).getAppWidgetIds(
            ComponentName(context, CompactListWidgetProvider::class.java)
        )
        intentCompact.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, idsCompact)
        context.sendBroadcast(intentCompact)

        // Update TrendChartWidget
        val intentTrend = Intent(context, TrendChartWidgetProvider::class.java).apply {
            action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
        }
        val idsTrend = AppWidgetManager.getInstance(context).getAppWidgetIds(
            ComponentName(context, TrendChartWidgetProvider::class.java)
        )
        intentTrend.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, idsTrend)
        context.sendBroadcast(intentTrend)
    }
}
