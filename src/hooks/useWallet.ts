import { useCallback, useEffect, useRef, useState } from 'react'

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  on?: (event: string, handler: (...args: unknown[]) => void) => void
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void
}

declare global {
  interface Window {
    ethereum?: EthereumProvider
  }
}

function getProvider(): EthereumProvider | undefined {
  return typeof window !== 'undefined' ? window.ethereum : undefined
}

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasProvider, setHasProvider] = useState(false)
  const onAccountsRef = useRef<((accounts: unknown) => void) | null>(null)

  // Detect wallet presence only — never request accounts on load.
  useEffect(() => {
    setHasProvider(Boolean(getProvider()))
  }, [])

  useEffect(() => {
    return () => {
      const provider = getProvider()
      const handler = onAccountsRef.current
      if (provider && handler) {
        provider.removeListener?.('accountsChanged', handler)
      }
      onAccountsRef.current = null
    }
  }, [])

  const attachAccountListener = useCallback((provider: EthereumProvider) => {
    if (onAccountsRef.current) return

    const onAccounts = (accounts: unknown) => {
      const list = Array.isArray(accounts) ? (accounts as string[]) : []
      setAddress(list[0] ?? null)
      setError(null)
    }

    onAccountsRef.current = onAccounts
    provider.on?.('accountsChanged', onAccounts)
  }, [])

  const connect = useCallback(async () => {
    const provider = getProvider()
    if (!provider) {
      setError('No wallet found. Install MetaMask or another browser wallet.')
      setHasProvider(false)
      return null
    }

    setHasProvider(true)
    setConnecting(true)
    setError(null)
    try {
      // Popup only happens here, after an explicit user click.
      const accounts = (await provider.request({
        method: 'eth_requestAccounts',
      })) as string[]
      const next = accounts[0] ?? null
      setAddress(next)
      if (!next) {
        setError('No account returned from wallet.')
      } else {
        attachAccountListener(provider)
      }
      return next
    } catch (err) {
      const code =
        typeof err === 'object' && err && 'code' in err
          ? Number((err as { code: number }).code)
          : undefined
      if (code === 4001) {
        setError('Connection rejected in wallet.')
      } else {
        setError('Could not connect wallet. Try again.')
      }
      return null
    } finally {
      setConnecting(false)
    }
  }, [attachAccountListener])

  const disconnect = useCallback(async () => {
    const provider = getProvider()
    try {
      await provider?.request({
        method: 'wallet_revokePermissions',
        params: [{ eth_accounts: {} }],
      })
    } catch {
      // Not all wallets support revoke; clear local session anyway.
    }
    setAddress(null)
    setError(null)
  }, [])

  return {
    address,
    connecting,
    error,
    hasProvider,
    isConnected: Boolean(address),
    connect,
    disconnect,
  }
}
