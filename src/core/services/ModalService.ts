import { useCallback, useReducer, Reducer } from "react";

export interface OpenModalState {
  isOpen?: boolean;
  isLoadControl?: boolean;
}

export interface OpenModalAction {
  type: string;
  payload?: OpenModalState;
}

export const CLOSE_MODAL = `CLOSE_MODAL`;
export const OPEN_MODAL = `OPEN_MODAL`;
export const LOAD_LIST = `LOAD_LIST`;

function openModalReducer(
  state: OpenModalState,
  action: OpenModalAction,
): OpenModalState {
  switch (action.type) {
    case OPEN_MODAL: {
      const { isOpen, isLoadControl } = action.payload;
      return {
        ...state,
        isOpen,
        isLoadControl,
      };
    }
    case CLOSE_MODAL: {
      return {
        ...state,
        isOpen: false,
        isLoadControl: false,
      };
    }
    case LOAD_LIST: {
      return {
        ...state,
        isLoadControl: true,
      };
    }
  }
}

/* services to filter, sort list, handleModalSave, handleModalClose */
export class ModalService {
  /**
   *
   * return business for open, close, control load data for vary kinds of modal(preview, mapping)
   * @param: selectionType: RowSelectionType (default is checkbox)
   * @return: { rowSelection,selectedRowKeys, setSelectedRowKeys }
   *
   * */
  useOpenModal(
    onOpen?: () => void,
    onClose?: () => void,
    onSave?: (data: any) => void,
  ) {
    const [{ isOpen, isLoadControl }, dispatch] = useReducer<
      Reducer<OpenModalState, OpenModalAction>
    >(openModalReducer, {
      isOpen: false,
      isLoadControl: false,
    });
    const handleOpenModal = useCallback(() => {
      if (typeof onOpen === "function") {
        onOpen();
      }
      dispatch({
        type: OPEN_MODAL,
        payload: { isOpen: true, isLoadControl: true },
      });
    }, [onOpen]);

    const handleCloseModal = useCallback(() => {
      if (typeof onClose === "function") {
        onClose();
      }
      dispatch({ type: CLOSE_MODAL });
    }, [onClose]);

    const handleSaveModal = useCallback(
      (data: any) => {
        if (typeof onSave === "function") {
          onSave(data);
        }
        dispatch({ type: CLOSE_MODAL });
      },
      [onSave],
    );

    const handleLoad = useCallback(() => {
      dispatch({ type: LOAD_LIST });
    }, []);

    return {
      isOpen,
      isLoadControl,
      handleOpenModal,
      handleCloseModal,
      handleSaveModal,
      handleLoad,
    };
  }
}

export default new ModalService();
