import { useCallback } from "react";

export interface openModalState {
  isOpen?: boolean;
  isLoadControl?: boolean;
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
  useOpenModal(onOpen?: () => void, onClose?: () => void, onSave?: () => void) {
    const handleOpenModal = useCallback(() => {
      if (typeof onOpen === "function") {
        onOpen();
      }
    }, [onOpen]);
    const handleCloseModal = useCallback(() => {
      if (typeof onClose === "function") {
        onClose();
      }
    }, [onClose]);
    const handleSaveModal = useCallback(() => {
      if (typeof onSave === "function") {
        onSave();
      }
    }, [onSave]);
    const handleLoad = useCallback(() => {}, []);
    return {
      handleOpenModal,
      handleCloseModal,
      handleSaveModal,
      handleLoad,
    };
  }
}

export default new ModalService();
