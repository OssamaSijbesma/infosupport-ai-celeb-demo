import React, {useState, forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import './ModalCelebs.css';

const ModalCelebs = forwardRef((props, ref) => {
  const [modalIsOpen, setIsOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    openModal: () => {
      setIsOpen(true);
    },
    closeModal: () => {
      setIsOpen(false);
    },
    isOpen: () => modalIsOpen
  }));

  function close() {
    setIsOpen(false);
  }

  return (
    <Modal 
      isOpen={modalIsOpen}
      onRequestClose={close}
      contentLabel="Celebs results modal"
      appElement={document.getElementById('root') || undefined}
      className='modal-celeb'
      >
        <section className='celeb-container'>
          <h2>Results</h2>
          <div className='results'>
            {props.results?.map(result => (
              <div className='result' key={result.name}>
                <img className='img-celeb' alt='predicted celeb' src={result.image} />
                <h3>{result.name}</h3>
                <p>Look alike factor: <span id="confidence">{result.confidence}%</span></p>
              </div>
            ))}
          </div>
          <button className='btn-modal' onClick={close}>Try Again <span role="img" aria-label="picture">🔁</span></button>
        </section>   
    </Modal>
  );
})

ModalCelebs.propTypes = {
  results: PropTypes.arrayOf(PropTypes.object),
}

export default ModalCelebs;
