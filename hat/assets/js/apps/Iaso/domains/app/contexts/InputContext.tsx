import React, { FunctionComponent, createContext, useMemo } from 'react';
import { useListenToInput } from './useListentToInput';

type InputContextObject = {
    hasInputCode: boolean;
    // setHasInputCode: Dispatch<SetStateAction<boolean>>;
};

const combination = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a',
    ' ',
];

const defaultContext: InputContextObject = {
    hasInputCode: false,
};
const InputContext = createContext<InputContextObject>(defaultContext);

const InputContextProvider: FunctionComponent = ({ children }) => {
    const hasInputCode = useListenToInput(combination);

    const contextValue = useMemo(() => {
        return { hasInputCode };
    }, [hasInputCode]);

    return (
        <InputContext.Provider value={contextValue}>
            {children}
        </InputContext.Provider>
    );
};

export { InputContext, InputContextProvider };
