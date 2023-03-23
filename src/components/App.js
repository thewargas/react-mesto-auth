import { useState, useEffect } from "react";
import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";
import ImagePopup from "./ImagePopup";
import api from "../utils/Api";
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";
import DeleteCardPopup from "./DeleteCardPopup";
import { CurrentUserContext } from "../contexts/CurrentUserContext";

function App() {
  const [isEditProfilePopupOpen, setEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setEditAvatarPopupOpen] = useState(false);
  const [isDeleteCardPopupOpen, setDeleteCardPopupOpen] = useState(false);
  const [isImagePopupOpen, setImagePopupOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState({});
  const [cards, setCards] = useState([]);
  const [card, setCard] = useState({});

  const [currentUser, setCurrentUser] = useState({});

  const [isError, setError] = useState({});
  const [messageError, setMessageError] = useState({});

  useEffect(() => {
    Promise.all([api.getInitialInfo(), api.getInitialCards()])

      .then(([userData, cardsData]) => {
        setCurrentUser(userData);
        setCards(cardsData);
      })

      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    const close = (e) => {
      if (e.keyCode === 27) {
        console.log("submit");
        closeAllPopups();
      }
    };
    if (
      isEditProfilePopupOpen ||
      isAddPlacePopupOpen ||
      isEditAvatarPopupOpen ||
      isDeleteCardPopupOpen ||
      isImagePopupOpen
    ) {
      document.addEventListener("keydown", close);
      return () => document.removeEventListener("keydown", close);
    }
  }, [
    isEditProfilePopupOpen,
    isAddPlacePopupOpen,
    isEditAvatarPopupOpen,
    isDeleteCardPopupOpen,
    isImagePopupOpen,
  ]);

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) {
      closeAllPopups();
    }
  }

  function handleCardLike(card) {
    const isLiked = card.likes.some((i) => i._id === currentUser._id);

    api
      .changeLikeCardStatus(card._id, !isLiked)
      .then((newCard) => {
        setCards((state) =>
          state.map((c) => (c._id === card._id ? newCard : c))
        );
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function handleCardDelete(card) {
    setLoading(true);
    api
      .deleteCard(card._id)
      .then(() => {
        setCards((state) => state.filter((c) => card._id !== c._id));
        setCard({});
        closeAllPopups();
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
        closeAllPopups();
      });
  }

  function handleUpdateUser(inputs) {
    setLoading(true);
    api
      .changeUserInfo(inputs)
      .then((data) => {
        setCurrentUser(data);
        closeAllPopups();
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
        closeAllPopups();
      });
  }

  function handleUpdateAvatar(input, clearInput) {
    setLoading(true);
    api
      .changeAvatar(input)
      .then((data) => {
        setCurrentUser(data);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
        closeAllPopups();
        clearInput();
      });
  }

  function handleAddPlaceSubmit(inputs, clearInputs) {
    setLoading(true);
    api
      .createCard(inputs)
      .then((newCard) => {
        setCards([newCard, ...cards]);
        closeAllPopups();
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
        closeAllPopups();
        clearInputs();
      });
  }

  function validateInputs(e) {
    if (!e.target.validity.valid) {
      setError({
        ...isError,
        [e.target.name]: true,
      });
      setMessageError({
        ...messageError,
        [e.target.name]: e.target.validationMessage,
      });
    } else {
      setError({
        ...isError,
        [e.target.name]: false,
      });
      setMessageError({
        ...messageError,
        [e.target.name]: "",
      });
    }
  }

  const handleEditAvatarClick = () => {
    setEditAvatarPopupOpen(true);
  };
  const handleEditProfileClick = () => {
    setEditProfilePopupOpen(true);
  };
  const handleAddPlaceClick = () => {
    setAddPlacePopupOpen(true);
  };
  const handleTrashButtonClick = (card) => {
    setDeleteCardPopupOpen(true);
    setCard(card);
  };
  const handleCardClick = (card) => {
    setSelectedCard(card);
    setImagePopupOpen(true);
  };

  const closeAllPopups = () => {
    setEditAvatarPopupOpen(false);
    setEditProfilePopupOpen(false);
    setAddPlacePopupOpen(false);
    setDeleteCardPopupOpen(false);
    setImagePopupOpen(false);

    setError({});
    setMessageError({});
  };

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <Header />
      <Main
        onEditProfile={handleEditProfileClick}
        onAddPlace={handleAddPlaceClick}
        onEditAvatar={handleEditAvatarClick}
        onCardClick={handleCardClick}
        onCardLike={handleCardLike}
        onCardDelete={handleTrashButtonClick}
        cards={cards}
      />
      <Footer />

      <EditAvatarPopup
        onValidation={validateInputs}
        isError={isError}
        messageError={messageError}
        onOverlay={handleOverlayClick}
        isLoading={isLoading}
        isOpen={isEditAvatarPopupOpen}
        onClose={closeAllPopups}
        onUpdateAvatar={handleUpdateAvatar}
      />

      <EditProfilePopup
        onValidation={validateInputs}
        isError={isError}
        messageError={messageError}
        onOverlay={handleOverlayClick}
        isLoading={isLoading}
        isOpen={isEditProfilePopupOpen}
        onClose={closeAllPopups}
        onUpdateUser={handleUpdateUser}
      />

      <AddPlacePopup
        onValidation={validateInputs}
        isError={isError}
        messageError={messageError}
        onOverlay={handleOverlayClick}
        isLoading={isLoading}
        isOpen={isAddPlacePopupOpen}
        onClose={closeAllPopups}
        onAddPlace={handleAddPlaceSubmit}
      />
      <DeleteCardPopup
        onOverlay={handleOverlayClick}
        isLoading={isLoading}
        isOpen={isDeleteCardPopupOpen}
        onClose={closeAllPopups}
        onDeleteCard={handleCardDelete}
        card={card}
      />
      <ImagePopup
        onOverlay={handleOverlayClick}
        isOpen={isImagePopupOpen}
        card={selectedCard}
        onClose={closeAllPopups}
      />
    </CurrentUserContext.Provider>
  );
}

export default App;
