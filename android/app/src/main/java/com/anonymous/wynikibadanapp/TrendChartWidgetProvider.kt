package com.anonymous.wynikibadanapp

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.view.View
import android.widget.RemoteViews
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class TrendChartWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val views = RemoteViews(context.packageName, R.layout.trend_chart_widget)

            try {
                val paramsArray = StorageHelper.getParameters(context)
                val resultsArray = StorageHelper.getResults(context)

                if (paramsArray.length() == 0) {
                    views.setTextViewText(R.id.param_name, "Brak badań")
                    views.setTextViewText(R.id.param_value, "-")
                    views.setViewVisibility(R.id.param_status, View.GONE)
                    views.setViewVisibility(R.id.chart_image, View.GONE)
                    views.setViewVisibility(R.id.no_data_chart_text, View.VISIBLE)
                } else {
                    // Default to first parameter, or find selected one
                    val param = paramsArray.getJSONObject(0)
                    val paramName = param.optString("name", "TSH")
                    val category = param.optString("category", "Inne")
                    val unit = param.optString("unit", "")
                    val refRange = param.optString("referenceRange", "Brak normy")

                    views.setTextViewText(R.id.param_name, paramName)

                    val catText = when (category) {
                        "Krew" -> "🩸 Krew"
                        "Tarczyca" -> "🦋 Tarczyca"
                        "Lipidy" -> "🥑 Lipidy"
                        "Mocz" -> "🧪 Mocz"
                        "Nerkowe" -> "💧 Nerkowe"
                        "Wątrobowe" -> "💊 Wątrobowe"
                        else -> "📋 $category"
                    }
                    views.setTextViewText(R.id.param_category, catText)

                    // Find all results for this parameter sorted chronologically
                    val sortedResults = getSortedResultsForParam(resultsArray, paramName)

                    if (sortedResults.isEmpty()) {
                        views.setTextViewText(R.id.param_value, "Brak wyników")
                        views.setViewVisibility(R.id.param_status, View.GONE)
                        views.setViewVisibility(R.id.chart_image, View.GONE)
                        views.setViewVisibility(R.id.no_data_chart_text, View.VISIBLE)
                    } else {
                        val latestResult = sortedResults.last()
                        val latestVal = latestResult.optDouble("value", 0.0)
                        val latestValStr = if (latestVal % 1.0 == 0.0) latestVal.toInt().toString() else latestVal.toString()
                        views.setTextViewText(R.id.param_value, "$latestValStr $unit")

                        views.setViewVisibility(R.id.param_status, View.VISIBLE)
                        val status = checkRange(latestVal, refRange)
                        when (status) {
                            "NORMAL" -> {
                                views.setTextViewText(R.id.param_status, "W normie")
                                views.setInt(R.id.param_status, "setBackgroundColor", 0xFF00C48C.toInt())
                                views.setTextColor(R.id.param_status, 0xFFFFFFFF.toInt())
                            }
                            "HIGH" -> {
                                views.setTextViewText(R.id.param_status, "Powyżej normy")
                                views.setInt(R.id.param_status, "setBackgroundColor", 0xFFFF5C6C.toInt())
                                views.setTextColor(R.id.param_status, 0xFFFFFFFF.toInt())
                            }
                            "LOW" -> {
                                views.setTextViewText(R.id.param_status, "Poniżej normy")
                                views.setInt(R.id.param_status, "setBackgroundColor", 0xFF74B9FF.toInt())
                                views.setTextColor(R.id.param_status, 0xFFFFFFFF.toInt())
                            }
                            else -> {
                                views.setTextViewText(R.id.param_status, "Brak normy")
                                views.setInt(R.id.param_status, "setBackgroundColor", 0xFF373950.toInt())
                                views.setTextColor(R.id.param_status, 0xFFEEF0F6.toInt())
                            }
                        }

                        if (sortedResults.size < 2) {
                            views.setViewVisibility(R.id.chart_image, View.GONE)
                            views.setViewVisibility(R.id.no_data_chart_text, View.VISIBLE)
                            views.setTextViewText(R.id.no_data_chart_text, "Wymagane min. 2 pomiary")
                        } else {
                            views.setViewVisibility(R.id.chart_image, View.VISIBLE)
                            views.setViewVisibility(R.id.no_data_chart_text, View.GONE)

                            // Render line chart dynamically onto a Bitmap
                            val chartBitmap = drawSparkline(sortedResults, refRange)
                            if (chartBitmap != null) {
                                views.setImageViewBitmap(R.id.chart_image, chartBitmap)
                            }
                        }
                    }
                }
            } catch (e: Throwable) {
                e.printStackTrace()
            }

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        private fun getSortedResultsForParam(resultsArray: JSONArray, paramName: String): List<JSONObject> {
            val list = mutableListOf<JSONObject>()
            for (i in 0 until resultsArray.length()) {
                val res = resultsArray.getJSONObject(i)
                if (res.optString("parameter", "") == paramName) {
                    list.add(res)
                }
            }
            // Sort chronologically by date
            list.sortBy { it.optString("date", "") }
            return list
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

        private fun drawSparkline(results: List<JSONObject>, rangeStr: String): Bitmap? {
            val width = 400
            val height = 150
            val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
            val canvas = Canvas(bitmap)

            // Background canvas color (deep dark #14151f)
            canvas.drawColor(Color.parseColor("#14151f"))

            // Parse points
            val vals = results.map { it.optDouble("value", 0.0) }

            val minVal = Math.min(vals.minOrNull() ?: 0.0, getMinNormLimit(rangeStr) ?: Double.MAX_VALUE)
            val maxVal = Math.max(vals.maxOrNull() ?: 10.0, getMaxNormLimit(rangeStr) ?: Double.MIN_VALUE)
            val valDiff = if (maxVal == minVal) 1.0 else maxVal - minVal

            val xMin = 0f
            val xMax = (results.size - 1).toFloat()

            // Padding inside chart canvas
            val padX = 20f
            val padY = 25f

            // Drawing helper function for coordinate mapping
            fun getX(index: Int): Float {
                return padX + (index.toFloat() / xMax) * (width - 2 * padX)
            }

            fun getY(value: Double): Float {
                val ratio = (value - minVal) / valDiff
                return (height - padY) - (ratio.toFloat() * (height - 2 * padY))
            }

            // 1. Draw reference range background zone (if valid range exists)
            val minNorm = getMinNormLimit(rangeStr)
            val maxNorm = getMaxNormLimit(rangeStr)
            val rangePaint = Paint().apply {
                color = Color.parseColor("#122b25") // Dark green accent tone
                style = Paint.Style.FILL
            }

            if (minNorm != null && maxNorm != null) {
                canvas.drawRect(0f, getY(maxNorm), width.toFloat(), getY(minNorm), rangePaint)
                
                // Draw dotted lines for norm limit boundaries
                val borderPaint = Paint().apply {
                    color = Color.parseColor("#1abfb3")
                    strokeWidth = 1f
                    style = Paint.Style.STROKE
                }
                canvas.drawLine(0f, getY(maxNorm), width.toFloat(), getY(maxNorm), borderPaint)
                canvas.drawLine(0f, getY(minNorm), width.toFloat(), getY(minNorm), borderPaint)
            } else if (maxNorm != null) {
                // E.g. <55
                canvas.drawRect(0f, getY(maxNorm), width.toFloat(), height.toFloat(), rangePaint)
                
                val borderPaint = Paint().apply {
                    color = Color.parseColor("#1abfb3")
                    strokeWidth = 1.5f
                    style = Paint.Style.STROKE
                }
                canvas.drawLine(0f, getY(maxNorm), width.toFloat(), getY(maxNorm), borderPaint)
            }

            // 2. Draw line path
            val linePaint = Paint().apply {
                color = Color.parseColor("#7c6cf0") // Violet primary accent
                style = Paint.Style.STROKE
                strokeWidth = 4.5f
                isAntiAlias = true
                strokeCap = Paint.Cap.ROUND
                strokeJoin = Paint.Join.ROUND
            }

            val path = Path()
            path.moveTo(getX(0), getY(vals[0]))
            for (i in 1 until vals.size) {
                path.lineTo(getX(i), getY(vals[i]))
            }
            canvas.drawPath(path, linePaint)

            // 3. Draw bullet points
            val pointPaint = Paint().apply {
                color = Color.parseColor("#22d3c5") // Cyan point color
                style = Paint.Style.FILL
                isAntiAlias = true
            }

            val outerPointPaint = Paint().apply {
                color = Color.parseColor("#7c6cf0")
                style = Paint.Style.STROKE
                strokeWidth = 3f
                isAntiAlias = true
            }

            for (i in vals.indices) {
                val cx = getX(i)
                val cy = getY(vals[i])
                canvas.drawCircle(cx, cy, 6f, pointPaint)
                canvas.drawCircle(cx, cy, 9f, outerPointPaint)
            }

            return bitmap
        }

        private fun getMinNormLimit(rangeStr: String): Double? {
            val clean = rangeStr.trim()
            if (clean.contains("-")) {
                val parts = clean.split("-")
                return parts[0].trim().replace(",", ".").toDoubleOrNull()
            }
            return null
        }

        private fun getMaxNormLimit(rangeStr: String): Double? {
            val clean = rangeStr.trim()
            if (clean.startsWith("<")) {
                return clean.substring(1).trim().replace(",", ".").toDoubleOrNull()
            } else if (clean.contains("-")) {
                val parts = clean.split("-")
                return parts[1].trim().replace(",", ".").toDoubleOrNull()
            }
            return null
        }
    }
}
