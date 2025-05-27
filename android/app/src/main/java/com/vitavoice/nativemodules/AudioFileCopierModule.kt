package com.vitavoice.nativemodules

import android.content.ContentResolver
import android.net.Uri
import android.provider.OpenableColumns
import com.facebook.react.bridge.*
import java.io.*

class AudioFileCopierModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val context = reactContext

    override fun getName(): String {
        return "AudioFileCopier"
    }

    @ReactMethod
    fun copyToInternal(uriString: String, promise: Promise) {
        try {
            val uri = Uri.parse(uriString)
            val resolver = context.contentResolver
            val cursor = resolver.query(uri, null, null, null, null)
            var fileName = "copied_audio_${System.currentTimeMillis()}.mp3"

            cursor?.use {
                val nameIndex = it.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                if (it.moveToFirst() && nameIndex != -1) {
                    fileName = it.getString(nameIndex)
                }
            }

            val destFile = File(context.filesDir, fileName)
            val inputStream = resolver.openInputStream(uri)
            val outputStream = FileOutputStream(destFile)

            inputStream?.use { input ->
                outputStream.use { output ->
                    input.copyTo(output)
                }
            }

            promise.resolve(destFile.absolutePath)
        } catch (e: Exception) {
            promise.reject("COPY_FAILED", e.message, e)
        }
    }
}
