package com.anonymous.wynikibadanapp

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.graphics.Color
import android.view.View
import android.widget.RemoteViews
import org.json.JSONArray
import org.json.JSONObject

class CompactListWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val views = RemoteViews(context.packageName, R.layout.compact_list_widget)

            try {
                val paramsArray = StorageHelper.getParameters(context)
                val resultsArray = StorageHelper.getResults(context)

                if (paramsArray.length() == 0) {
                    views.setViewVisibility(R.id.empty_text, View.VISIBLE)
                    views.setViewVisibility(R.id.rows_container, View.GONE)
                } else {
                    views.setViewVisibility(R.id.empty_text, View.GONE)
                    views.setViewVisibility(R.id.rows_container, View.VISIBLE)

                    // We display up to 5 parameters
                    val displayCount = Math.min(paramsArray.length(), 5)

                    // First hide all rows as safety fallback
                    for (i in 1..5) {
                        val rowId = context.resources.getIdentifier("row$i", "id", context.packageName)
                        if (rowId != 0) {
                            views.setViewVisibility(rowId, View.GONE)
                        }
                    }

                    for (i in 0 until displayCount) {
                        val param = paramsArray.getJSONObject(i)
                        val paramName = param.optString("name", "")
                        val category = param.optString("category", "Inne")
                        val unit = param.optString("unit", "")
                        val refRange = param.optString("referenceRange", "Brak normy")

                        val rowNum = i + 1
                        val rowId = context.resources.getIdentifier("row$rowNum", "id", context.packageName)
                        val nameId = context.resources.getIdentifier("row${rowNum}_name", "id", context.packageName)
                        val categoryId = context.resources.getIdentifier("row${rowNum}_category", "id", context.packageName)
                        val valueId = context.resources.getIdentifier("row${rowNum}_value", "id", context.packageName)
                        val statusId = context.resources.getIdentifier("row${rowNum}_status", "id", context.packageName)
                        val accentId = context.resources.getIdentifier("row${rowNum}_accent", "id", context.packageName)

                        if (rowId == 0) continue

                        views.setViewVisibility(rowId, View.VISIBLE)
                        views.setTextViewText(nameId, paramName)

                        // Format category with nice prefix
                        val catText = when (category) {
                            "Krew" -> "🩸 Krew"
                            "Tarczyca" -> "🦋 Tarczyca"
                            "Lipidy" -> "🥑 Lipidy"
                            "Mocz" -> "🧪 Mocz"
                            "Nerkowe" -> "💧 Nerkowe"
                            "Wątrobowe" -> "💊 Wątrobowe"
                            else -> "📋 $category"
                        }
                        views.setTextViewText(categoryId, catText)

                        // Find latest result for this parameter
                        val latestResult = getLatestResultForParam(resultsArray, paramName)
                        if (latestResult != null) {
                            val resVal = latestResult.optDouble("value", 0.0)
                            val resValStr = if (resVal % 1.0 == 0.0) resVal.toInt().toString() else resVal.toString()
                            views.setTextViewText(valueId, "$resValStr $unit")

                            // Check status and set badge background color safely
                            val status = checkRange(resVal, refRange)
                            when (status) {
                                "NORMAL" -> {
                                    views.setTextViewText(statusId, "W normie")
                                    views.setInt(statusId, "setBackgroundColor", 0xFF00C48C.toInt())
                                    views.setTextColor(statusId, 0xFFFFFFFF.toInt())
                                }
                                "HIGH" -> {
                                    views.setTextViewText(statusId, "Powyżej normy")
                                    views.setInt(statusId, "setBackgroundColor", 0xFFFF5C6C.toInt())
                                    views.setTextColor(statusId, 0xFFFFFFFF.toInt())
                                }
                                "LOW" -> {
                                    views.setTextViewText(statusId, "Poniżej normy")
                                    views.setInt(statusId, "setBackgroundColor", 0xFF74B9FF.toInt())
                                    views.setTextColor(statusId, 0xFFFFFFFF.toInt())
                                }
                                else -> {
                                    views.setTextViewText(statusId, "Brak normy")
                                    views.setInt(statusId, "setBackgroundColor", 0xFF373950.toInt())
                                    views.setTextColor(statusId, 0xFFEEF0F6.toInt())
                                }
                            }
                        } else {
                            views.setTextViewText(valueId, "Brak wyników")
                            views.setTextViewText(statusId, "Brak normy")
                            views.setInt(statusId, "setBackgroundColor", 0xFF373950.toInt())
                            views.setTextColor(statusId, 0xFFEEF0F6.toInt())
                        }

                        // Style left accent line
                        val accentColor = when (rowNum) {
                            1 -> 0xFF7C6CF0.toInt() // Violet
                            2 -> 0xFF22D3C5.toInt() // Teal
                            3 -> 0xFF00C48C.toInt() // Green
                            4 -> 0xFFFFB74D.toInt() // Orange
                            else -> 0xFFFF5C6C.toInt() // Red
                        }
                        views.setInt(accentId, "setBackgroundColor", accentColor)
                    }
                }
            } catch (e: Throwable) {
                e.printStackTrace()
            }

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        private fun getLatestResultForParam(resultsArray: JSONArray, paramName: String): JSONObject? {
            var latest: JSONObject? = null
            var latestDate = ""
            for (i in 0 until resultsArray.length()) {
                val res = resultsArray.getJSONObject(i)
                if (res.optString("parameter", "") == paramName) {
                    val date = res.optString("date", "")
                    if (latest == null || date >= latestDate) {
                        latest = res
                        latestDate = date
                    }
                }
            }
            return latest
        }

        private fun checkRange(value: Double, rangeStr: String): String {
            val clean = rangeStr.trim()
            if (clean.startsWith("<")) {
                val limit = clean.substring(1).trim().replace(",", ".").toDoubleOrNull()
                if (limit != null) {
                    return if (value < limit) "NORMAL" else "HIGH"
                }
            } else if (clean.startsWith(">")) {
                val limit = clean.substring(1).trim().replace(",", ".").toDoubleOrNull()
                if (limit != null) {
                    return if (value > limit) "NORMAL" else "LOW"
                }
            } else if (clean.contains("-")) {
                val parts = clean.split("-")
                if (parts.size == 2) {
                    val min = parts[0].trim().replace(",", ".").toDoubleOrNull()
                    val max = parts[1].trim().replace(",", ".").toDoubleOrNull()
                    if (min != null && max != null) {
                        return when {
                            value < min -> "LOW"
                            value > max -> "HIGH"
                            else -> "NORMAL"
                        }
                    }
                }
            }
            return "UNKNOWN"
        }
    }
}
