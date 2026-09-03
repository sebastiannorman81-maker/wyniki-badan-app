package com.anonymous.wynikibadanapp

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import org.json.JSONArray

object StorageHelper {
    fun getAsyncStorageValue(context: Context, key: String): String? {
        val dbFile = context.getDatabasePath("RKStorage")
        if (!dbFile.exists()) return null
        
        var db: SQLiteDatabase? = null
        try {
            db = SQLiteDatabase.openDatabase(dbFile.absolutePath, null, SQLiteDatabase.OPEN_READONLY)
            val cursor = db.rawQuery("SELECT value FROM catalystLocalStorage WHERE key = ?", arrayOf(key))
            if (cursor.moveToFirst()) {
                val value = cursor.getString(0)
                cursor.close()
                return value
            }
            cursor.close()
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            db?.close()
        }
        return null
    }

    fun getParameters(context: Context): JSONArray {
        val raw = getAsyncStorageValue(context, "@wyniki_badania_parameters") ?: return JSONArray()
        return try {
            JSONArray(raw)
        } catch (e: Exception) {
            JSONArray()
        }
    }

    fun getResults(context: Context): JSONArray {
        val raw = getAsyncStorageValue(context, "@wyniki_badania_results") ?: return JSONArray()
        return try {
            JSONArray(raw)
        } catch (e: Exception) {
            JSONArray()
        }
    }
}
