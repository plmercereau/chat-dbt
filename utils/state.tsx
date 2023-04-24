import {
    Dispatch,
    PropsWithChildren,
    SetStateAction,
    createContext,
    useContext,
    useState
} from 'react'
import { GptSqlResponse } from '@/shared/chat-gpt'

export type AppContextType = {
    history: GptSqlResponse[]
    setHistory: Dispatch<SetStateAction<GptSqlResponse[]>>
    loading: boolean
    setLoading: Dispatch<SetStateAction<boolean>>
}

const initialState: AppContextType = {
    history: [],
    setHistory: () => {},
    loading: false,
    setLoading: () => {}
}

const AppContext = createContext<AppContextType>(initialState)

export const AppWrapper: React.FC<PropsWithChildren> = ({ children }) => {
    const [history, setHistory] = useState<GptSqlResponse[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    return (
        <AppContext.Provider
            value={{
                history,
                setHistory,
                loading,
                setLoading
            }}
        >
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => useContext(AppContext)
