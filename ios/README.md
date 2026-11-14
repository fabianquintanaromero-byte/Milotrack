# MiloTrack para iPhone

La aplicación se abre desde la pantalla de inicio y conserva su propia sesión de SOS. Usa SwiftUI para la navegación y WebKit para el mapa y la ficha publicados en SOS.

## Compilar y probar

En macOS, instala Xcode y XcodeGen y ejecuta `xcodegen generate --spec ios/project.yml` desde la raíz. Abre `ios/MiloTrack.xcodeproj` y ejecuta el esquema **MiloTrack**. El flujo **MiloTrack iOS** de GitHub Actions compila para simulador y para iPhone y guarda la versión de simulador como artefacto.

## Enviar a TestFlight

1. Crea el identificador `com.maniaprod.milotrack` en tu equipo de Apple Developer y registra MiloTrack en App Store Connect.
2. En Xcode, selecciona el equipo de firma y activa la firma automática. Selecciona **Any iOS Device**, archiva con **Product → Archive** y sube la compilación a App Store Connect desde Organizer.
3. En TestFlight crea el grupo de pruebas y envía la compilación a revisión para habilitar una invitación externa. Una vez aprobada, comparte con la persona invitada el enlace de instalación de TestFlight.

La compilación sin firma de GitHub Actions comprueba el código. Para instalar en un iPhone físico hace falta una compilación firmada.
