package com.seifguard.app

import android.content.ComponentName
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val Background = Color(0xFF090611)
private val Panel = Color(0xFF171024)
private val Neon = Color(0xFFC45CFF)
private val Muted = Color(0xFFB9ADC8)

data class LauncherChoice(
    val id: String,
    val title: String,
    val variant: String,
    val alias: String
)

private val choices = listOf(
    LauncherChoice("calendar_1", "Calendar", "Classic", "com.seifguard.app.CalendarClassic"),
    LauncherChoice("calendar_2", "Calendar", "Modern", "com.seifguard.app.CalendarModern"),
    LauncherChoice("calendar_3", "Calendar", "Minimal", "com.seifguard.app.CalendarMinimal"),
    LauncherChoice("clock_1", "Clock", "Classic", "com.seifguard.app.ClockClassic"),
    LauncherChoice("clock_2", "Clock", "Modern", "com.seifguard.app.ClockModern"),
    LauncherChoice("clock_3", "Clock", "Minimal", "com.seifguard.app.ClockMinimal"),
    LauncherChoice("files_1", "Files", "Classic", "com.seifguard.app.FilesClassic"),
    LauncherChoice("files_2", "Files", "Modern", "com.seifguard.app.FilesModern"),
    LauncherChoice("files_3", "Files", "Minimal", "com.seifguard.app.FilesMinimal")
)

class MainActivity : ComponentActivity() {
    private val prefs by lazy { getSharedPreferences("seif_guard_settings", MODE_PRIVATE) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val savedId = prefs.getString("launcher_choice", "calendar_1") ?: "calendar_1"
        setContent {
            MaterialTheme(colorScheme = darkColorScheme(
                primary = Neon,
                background = Background,
                surface = Panel,
                onPrimary = Background,
                onBackground = Color.White,
                onSurface = Color.White
            )) {
                var selected by remember { mutableStateOf(savedId) }
                Surface(modifier = Modifier.fillMaxSize(), color = Background) {
                    IdentityScreen(selected = selected, onSelect = { choice ->
                        switchLauncher(choice)
                        selected = choice.id
                    })
                }
            }
        }
    }

    private fun switchLauncher(choice: LauncherChoice) {
        val pm = packageManager
        val selectedComponent = ComponentName(this, choice.alias)
        pm.setComponentEnabledSetting(
            selectedComponent,
            PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
            PackageManager.DONT_KILL_APP
        )
        choices.filter { it.id != choice.id }.forEach { item ->
            pm.setComponentEnabledSetting(
                ComponentName(this, item.alias),
                PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                PackageManager.DONT_KILL_APP
            )
        }
        prefs.edit().putString("launcher_choice", choice.id).apply()
    }
}

@Composable
private fun IdentityScreen(selected: String, onSelect: (LauncherChoice) -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize().background(Background).padding(22.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Spacer(Modifier.height(12.dp))
        Text("SEIF-GUARD", color = Neon, fontSize = 27.sp, fontWeight = FontWeight.Bold)
        Text("اختر هوية التطبيق", color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.SemiBold)
        Text(
            "اختر الاسم والتصميم الذي سيظهران في الشاشة الرئيسية. يمكنك تغييره لاحقًا.",
            color = Muted,
            fontSize = 14.sp,
            lineHeight = 21.sp
        )
        listOf("Calendar", "Clock", "Files").forEach { identity ->
            Text(identity, color = Neon, fontSize = 17.sp, fontWeight = FontWeight.Bold)
            val group = choices.filter { it.title == identity }
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                group.forEach { choice ->
                    val active = selected == choice.id
                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .background(if (active) Color(0xFF2A1740) else Panel, RoundedCornerShape(14.dp))
                            .border(1.dp, if (active) Neon else Color(0xFF342743), RoundedCornerShape(14.dp))
                            .clickable { onSelect(choice) }
                            .padding(vertical = 15.dp, horizontal = 5.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(7.dp)
                    ) {
                        Text(
                            when (identity) {
                                "Calendar" -> listOf("▦", "▤", "▣")[group.indexOf(choice)]
                                "Clock" -> listOf("◷", "◴", "◉")[group.indexOf(choice)]
                                else -> listOf("▰", "▱", "▣")[group.indexOf(choice)]
                            },
                            color = Neon,
                            fontSize = 28.sp
                        )
                        Text(choice.variant, color = Color.White, fontSize = 12.sp)
                        if (active) Text("محدد", color = Neon, fontSize = 11.sp)
                    }
                }
            }
        }
        Spacer(Modifier.height(4.dp))
        Text(
            "ملاحظة: قد يحتاج المشغّل إلى لحظات لتحديث الاسم والأيقونة بعد الاختيار. هذا يغيّر اختصار الشاشة الرئيسية فقط، ولا يخفي التطبيق من إعدادات Android.",
            color = Muted,
            fontSize = 12.sp,
            lineHeight = 18.sp
        )
    }
}
