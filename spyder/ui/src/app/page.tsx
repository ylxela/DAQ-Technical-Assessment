"use client"

import { useState, useEffect } from "react"
import useWebSocket, { ReadyState } from "react-use-websocket"
import { useTheme } from "next-themes"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Thermometer } from "lucide-react"
import Numeric from "../components/custom/numeric"
import RedbackLogoDarkMode from "../../public/logo-darkmode.svg"
import RedbackLogoLightMode from "../../public/logo-lightmode.svg"

const WS_URL = "ws://localhost:8080"

interface VehicleData {
  battery_temperature: number
  timestamp: number
  connect: string;
  error: string;
}

/**
 * Page component that displays DAQ technical assessment. Contains the LiveValue component as well as page header and labels.
 * Could this be split into more components?...
 *
 * @returns {JSX.Element} The rendered page component.
 */
  export default function Page(): JSX.Element {
    const { theme, setTheme } = useTheme()
    const [temperature, setTemperature] = useState<any>(0)
    const [connectionStatus, setConnectionStatus] = useState<string>("Disconnected")
    const [errorMessage, setErrorMessage] = useState<string>("")
    const [criticalError, setCriticalError] = useState<boolean>(false)
    const { lastJsonMessage, readyState }: { lastJsonMessage: VehicleData | null; readyState: ReadyState } = useWebSocket(
      WS_URL,
      {
        share: false,
        shouldReconnect: () => true,
      },
    )

    /**
     * Effect hook to handle WebSocket connection state changes.
     */
    useEffect(() => {
      switch (readyState) {
        case ReadyState.OPEN:
          console.log("Connected to streaming service")
          setConnectionStatus("Connected")
          break
        case ReadyState.CLOSED:
          console.log("Disconnected from streaming service")
          setConnectionStatus("Disconnected")
          break
        case ReadyState.CONNECTING:
          setConnectionStatus("Connecting")
          break
        default:
          setConnectionStatus("Disconnected")
          break
      }
    }, [readyState])

    /**
     * Effect hook to handle incoming WebSocket messages.
     */
    useEffect(() => {
      console.log("Received: ", lastJsonMessage)

      if (lastJsonMessage === null) {
        return
      } else if (lastJsonMessage.connect === "false") {
        setConnectionStatus("Disconnected");
        return
      } else if (lastJsonMessage.connect === "true") {
        setConnectionStatus("Connected");
        return
      } else if (lastJsonMessage.error) {
        setErrorMessage(lastJsonMessage.error)
        if (lastJsonMessage.error === "Battery temperature out of safe range more than 3 times in 5 seconds."){
          setCriticalError(true);
          return;
        }
        return;
      }
      setTemperature(lastJsonMessage.battery_temperature)
    }, [lastJsonMessage])

    /**
     * Effect hook to set the theme to dark mode.
     */
    const toggleTheme = () => {
      setTheme(theme === "dark" ? "light" : "dark")
    }

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded shadow-lg max-w-sm z-50">
          <div className="flex justify-between items-start">
            <p className="pr-4">{errorMessage}</p>
          </div>
        </div>
        <header className="px-5 h-20 flex items-center gap-5 border-b">
          <Image
            src={theme === "dark" ? RedbackLogoDarkMode : RedbackLogoLightMode}
            className="h-12 w-auto"
            alt="Redback Racing Logo"
          />
          <h1 className="text-foreground text-xl font-semibold">DAQ Technical Assessment</h1>

          <button
            onClick={toggleTheme}
            className="ml-auto mr-4 px-3 py-2 text-sm border rounded"
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>

          {criticalError && (
            <div className="flex items-center gap-2 mr-4">
              <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/50"></div>
              <span className="text-sm text-red-500 font-semibold">CRITICAL</span>
              <button
                onClick={() => setCriticalError(false)}
                className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
              >
              Reset
              </button>
            </div>

          )}

          <Badge variant={connectionStatus === "Connected" ? "success" : "destructive"} className="ml-auto">
            {connectionStatus}
          </Badge>
        </header>
        <main className="flex-grow flex items-center justify-center p-8">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl font-light flex items-center gap-2">
                <Thermometer className="h-6 w-6" />
                Live Battery Temperature
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <Numeric temp={temperature} />
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }
