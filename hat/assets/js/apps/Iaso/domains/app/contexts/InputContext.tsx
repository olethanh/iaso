import React, {
    FunctionComponent,
    createContext,
    useMemo,
    useEffect,
} from 'react';
import { useDispatch } from 'react-redux';
import { baseUrls } from '../../../constants/urls';
import { redirectTo } from '../../../routing/actions';
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

const url = baseUrls.hidden;

const defaultContext: InputContextObject = {
    hasInputCode: false,
};
const InputContext = createContext<InputContextObject>(defaultContext);

const InputContextProvider: FunctionComponent = ({ children }) => {
    const dispatch = useDispatch();
    const hasInputCode = useListenToInput(combination);

    useEffect(() => {
        if (hasInputCode) {
            dispatch(redirectTo(url, {}));
        }
    }, [dispatch, hasInputCode]);

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
