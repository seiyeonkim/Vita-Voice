package com.vitavoice

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.DocumentsContract
import android.provider.MediaStore
import android.provider.OpenableColumns
import com.facebook.react.bridge.*

class AudioPickerModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    private var pickerPromise: Promise? = null

    companion object {
        private const val REQUEST_CODE = 9999
    }

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String = "AudioPicker"

    @ReactMethod
    fun openAudioPicker(promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject("ACTIVITY_NULL", "Activity is null")
            return
        }

        pickerPromise = promise
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "audio/*"
            // Android Oreo 이상부터 초기 URI 지정
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                putExtra(
                    DocumentsContract.EXTRA_INITIAL_URI,
                    MediaStore.Audio.Media.EXTERNAL_CONTENT_URI
                )
            }
        }
        activity.startActivityForResult(intent, REQUEST_CODE)
    }

    override fun onActivityResult(
        activity: Activity?,
        requestCode: Int,
        resultCode: Int,
        data: Intent?
    ) {
        if (requestCode == REQUEST_CODE && pickerPromise != null) {
            if (resultCode == Activity.RESULT_OK && data?.data != null) {
                val resultUri: Uri = data.data!!
                val contentResolver = reactApplicationContext.contentResolver

                // 파일 이름 가져오기
                var fileName = "audio_file"
                contentResolver.query(resultUri, null, null, null, null)?.use { cursor ->
                    val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                    if (cursor.moveToFirst() && nameIndex != -1) {
                        fileName = cursor.getString(nameIndex).substringBeforeLast('.')
                    }
                }

                val result = Arguments.createMap().apply {
                    putString("uri", resultUri.toString())
                    putString("name", fileName)
                }
                pickerPromise?.resolve(result)
            } else {
                pickerPromise?.resolve(null)
            }
            pickerPromise = null
        }
    }

    override fun onNewIntent(intent: Intent?) { /* not used */ }
}
