// ===================
// ©AngelaMos | 2026
// App.tsx
// ===================

import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { queryClient } from '@/core/api'
import { router } from '@/core/app/router'
import { CyberAIChatbot } from '@/components/cyber-ai-chatbot/CyberAIChatbot'

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <CyberAIChatbot
        projectName="Honeypot Network"
        projectDescription="Deception network collecting telemetry, attacker payloads, and MITRE ATT&CK mapping."
        quickPrompts={[
          'Analyze attacker session logs',
          'Map recent activity to MITRE ATT&CK',
          'Extract suspicious IOCs from payload',
          'Recommend firewall blocking rule',
        ]}
      />
      <Toaster position="bottom-right" theme="dark" richColors />
    </QueryClientProvider>
  )
}
