package com.anonymous.wynikibadanapp

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import org.json.JSONArray

object StorageHelper {

    fun getParameters(context: Context): JSONArray {
        // 1. Try SharedPreferences first (highest priority, always in sync)
        val prefs = context.getSharedPreferences("WynikiBadanWidgets", Context.MODE_PRIVATE)
        val prefsData = prefs.getString("params", null)
        if (!prefsData.isNullOrBlank() && prefsData != "[]") {
            try {
                return JSONArray(prefsData)
            } catch (e: Exception) {
                // fallback
            }
        }

        // 2. Try AsyncStorage Room SQLite database
        val roomData = querySqlite(context, "AsyncStorage", "Storage", "key", "value", "@wyniki_badania_parameters")
        if (!roomData.isNullOrBlank()) {
            try {
                return JSONArray(roomData)
            } catch (e: Exception) {
                // fallback
            }
        }

        // 3. Try legacy RKStorage SQLite database
        val legacyData = querySqlite(context, "RKStorage", "catalystLocalStorage", "key", "value", "@wyniki_badania_parameters")
        if (!legacyData.isNullOrBlank()) {
            try {
                return JSONArray(legacyData)
            } catch (e: Exception) {
                // fallback
            }
        }

        return JSONArray()
    }

    fun getResults(context: Context): JSONArray {
        // 1. Try SharedPreferences first (highest priority, always in sync)
        val prefs = context.getSharedPreferences("WynikiBadanWidgets", Context.MODE_PRIVATE)
        val prefsData = prefs.getString("results", null)
        if (!prefsData.isNullOrBlank() && prefsData != "[]") {
            try {
                return JSONArray(prefsData)
            } catch (e: Exception) {
                // fallback
            }
        }

        // 2. Try AsyncStorage Room SQLite database
        val roomData = querySqlite(context, "AsyncStorage", "Storage", "key", "value", "@wyniki_badania_results")
        if (!roomData.isNullOrBlank()) {
            try {
                return JSONArray(roomData)
            } catch (e: Exception) {
                // fallback
            }
        }

        // 3. Try legacy RKStorage SQLite database
        val legacyData = querySqlite(context, "RKStorage", "catalystLocalStorage", "key", "value", "@wyniki_badania_results")
        if (!legacyData.isNullOrBlank()) {
            try {
                return JSONArray(legacyData)
            } catch (e: Exception) {
                // fallback
            }
        }

        return JSONArray()
    }

    private fun querySqlite(
        context: Context,
        dbName: String,
        tableName: String,
        keyColumn: String,
        valueColumn: String,
        targetKey: String
    ): String? {
        val dbFile = context.getDatabasePath(dbName)
        if (!dbFile.exists()) return null

        var db: SQLiteDatabase? = null
        try {
            db = SQLiteDatabase.openDatabase(dbFile.absolutePath, null, SQLiteDatabase.OPEN_READONLY)
            val cursor = db.rawQuery("SELECT $valueColumn FROM $tableName WHERE $keyColumn = ?", arrayOf(targetKey))
            if (cursor.moveToFirst()) {
                val result = cursor.getString(0)
                cursor.close()
                return result
            }
            cursor.close()
        } catch (e: Exception) {
            // Ignore database lock or schema differences
        } finally {
            try {
                db?.close()
            } catch (ignored: Exception) {}
        }
        return null
    }
}
