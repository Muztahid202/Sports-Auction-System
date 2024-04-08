import React from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { SelectButton } from 'primereact/selectbutton';

const PlayerModal = ({
  visible,
  onHide,
  onInvite,
  basePrice,
  onBasePriceChange,
  category,
  onCategoryChange,
}) => {
  return (
    <Dialog
      header="Invite Player"
      visible={visible}
      style={{ width: '350px' }}
      onHide={onHide}
    >
      <div className="p-grid p-fluid">
        <div className="p-col-12">
          <span className="p-float-label">
            <InputText
              id="basePrice"
              type="number"
              value={basePrice}
              onChange={onBasePriceChange}
            />
            <label htmlFor="basePrice">Base Price</label>
          </span>
        </div>
        <div className="p-col-12">
          <span className="p-float-label">
            <SelectButton
              value={category}
              options={['A', 'B', 'C']}
              onChange={onCategoryChange}
            />

            <label htmlFor="category">Category</label>
          </span>
        </div>
      </div>
      <div className="p-dialog-footer">
        <Button label="Invite" icon="pi pi-check" onClick={onInvite} />
        <Button label="Cancel" icon="pi pi-times" onClick={onHide} />
      </div>
    </Dialog>
  );
};

export default PlayerModal;
