import React, { useState } from 'react';

// Google map
import {
  GoogleMap,
  useLoadScript,
  Marker,
  Circle,
} from '@react-google-maps/api';

// axios
import axios from 'axios';

import Spinner from 'react-bootstrap/Spinner';
import Navbar from '../../componets/Navbar';

import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';
import AddImage from '../../componets/AddImage';
import Footer from '../../componets/Footer';
import FormInput from '../../componets/FormInput';

const mapContainerStyle = {
  width: '100%',
  height: '450px',
};
const center = {
  lat: 48.148598,
  lng: 17.107748,
};

const optionsMarker = {
  circle: {
    radius: 500,
    fillColor: '#FF0000',
    strokeColor: '#ff0000',
    strokeOpacity: 0.35,
    strokeWeight: 0.5,
    fillOpacity: 0.35,
    draggable: false,
  },
  marker: {
    fillColor: 'yellow',
  },
};

function Lostpet() {
  const [markers, setMarkers] = useState([]);
  const [error, setError] = useState(null);
  const [image, setImage] = useState();
  const [values, setValues] = useState({
    ownerName: '',
    email: '',
    tel: '',
    petName: '',
    details: '',
    lostDate: '',
  });

  const inputs = [
    {
      id: 1,
      name: 'ownerName',
      type: 'text',
      placeholder: 'John Doe',
      label: 'Meno a priezvisko',
    },
    {
      id: 2,
      name: 'email',
      type: 'text',
      placeholder: 'john@example.com',
      label: 'Email',
    },
    {
      id: 3,
      name: 'tel',
      type: 'text',
      placeholder: '09...',
      label: 'Tel. číslo',
    },
    {
      id: 4,
      name: 'petName',
      type: 'text',
      placeholder: 'Majlo',
      label: 'Meno zvieratka',
    },
    {
      id: 5,
      name: 'details',
      type: 'text',
      placeholder: '',
      label: 'Popis zvieratka',
    },
    {
      id: 6,
      name: 'lostDate',
      type: 'text',
      placeholder: '',
      label: 'Kedy sa stratil?',
    },
  ];

  const onChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const onMapClick = (e, props) => {
    setMarkers((current) => [
      ...current,
      {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      },
    ]);

    if (markers.length > 0) {
      setMarkers(markers.slice(0, 1));
      setMarkers(markers.slice(1));
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    let imageUrl = '';
    if (image) {
      const formData = new FormData();
      formData.append('file', image);
      formData.append('upload_preset', 'nicepreset');
      const dataRes = await axios.post(
        'https://api.cloudinary.com/v1_1/hachi-app/image/upload',
        formData
      );
      imageUrl = dataRes.data.url;
    }

    const data = {
      ownerName: values.ownerName,
      email: values.email,
      tel: values.tel,
      petName: values.petName,
      details: values.details,
      lostDate: values.lostDate,
      lat: markers[0].lat,
      lng: markers[0].lng,
      image: imageUrl,
    };

    await axios
      .post('/handleSubmit', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((res) => {
        res.redirect('/map');
      })
      .catch((err) => {
        err.response.data.msg && setError(err.response.data.msg);
      });
  };

  const [libraries] = useState(['places']);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API,
    libraries,
  });

  if (loadError) return 'Error loading maps';
  if (!isLoaded) return <Spinner animation="border" variant="dark" />;

  console.log(values.ownerName);
  return (
    <div className="dark overflow-hidden font-sora">
      <Navbar />
      <section>
        <form onSubmit={submitHandler}>
          <div className="flex flex-col ml-36 mt-10">
            <h1 className="text-3xl font-bold">Osobné údaje</h1>
            {inputs.map((input) => (
              <FormInput
                key={input.id}
                {...input}
                value={values[input.name]}
                onChange={onChange}
              />
            ))}
          </div>

          <div className="m-20">
            <h1 className="text-4xl font-bold mb-5">
              Kde bol naposledy videný/á?
            </h1>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={13}
              center={center}
              onClick={onMapClick}
            >
              <div id="mapMarkers">
                {markers.map((marker) => (
                  <Marker
                    position={{ lat: marker.lat, lng: marker.lng }}
                    name="marker"
                  />
                ))}
                {markers.map((marker) => (
                  <Circle
                    center={{ lat: marker.lat, lng: marker.lng }}
                    options={optionsMarker.circle}
                    name="marker"
                  />
                ))}
              </div>
            </GoogleMap>
          </div>

          <section className="m-20">
            <h1 className="text-4xl font-bold mb-10">Fotky maznáčika</h1>
            <div>
              {error && <Alert variant="danger">{error}</Alert>}
              <input
                type="file"
                className="mt-2 block w-full text-sm font-sora text-slate-500
                file:mr-4 file:py-2 file:px-4 file:font-sora
                file:rounded-full file:border-0
                file:text-lg file:font-semibold
                file:duration-300
                file:bg-violet-50 file:text-Black-700
                hover:file:bg-violet-200"
                name="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                id="validationFormik107"
                feedbackTooltip
              />
            </div>
          </section>

          <div className=" mx-20 mb-36">
            <input
              type="submit"
              value="Vytvoriť profil"
              className="py-3 px-16 bg-yellow-300 text-2xl font-semibold rounded-lg hover:bg-gray-400 hover:text-white duration-300"
            />
          </div>
        </form>
      </section>

      <Footer />
    </div>
  );
}

export default Lostpet;
