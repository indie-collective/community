import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Button } from 'react-bootstrap';

import StructureSelect from 'components/CountrySelect';
import CountrySelect from 'components/CountrySelect';

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

const EventForm = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [startAt, setStartAt] = useState(new Date());
  const [endAt, setEndAt] = useState(new Date());
  const [structure, setStructure] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name, about, startAt, endAt, structures, country, city });
      }}
    >
      <Form.Group controlId="event.name">
        <Form.Label>Name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <Form.Text className="text-muted">
          What is this event called?
        </Form.Text>
      </Form.Group>

      <Form.Group controlId="event.about">
        <Form.Label>About</Form.Label>
        <Form.Control
          as="textarea"
          rows="3"
          value={about}
          onChange={e => setAbout(e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="event.structures">
        <Form.Label>Who is organizing?</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter structure"
          value={structure}
          onChange={e => setStructure(e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="event.start">
        <Form.Label>Start</Form.Label>
        <Form.Control
          type="date"
          value={startAt.toJSON().split('T')[0]}
          onChange={(e) => {
            const newDate = new Date(e.target.value + 'T' + startAt.toJSON().split('T')[1]);
            setStartAt(newDate);
            
            if (startAt > endAt) {
              setEndAt(newDate);
            }
          }}
        />
      </Form.Group>

      <Form.Group controlId="event.country">
        <Form.Label>Country</Form.Label>
        <CountrySelect
          value={country}
          onChange={(event, { newValue, method }) => {
            setCountry(newValue);
          }}
        />
      </Form.Group>

      <Form.Group controlId="event.city">
        <Form.Label>City</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter name"
          value={city}
          onChange={e => setCity(e.target.value)}
        />
      </Form.Group>

      <Button variant="primary" type="submit">
        Create event
      </Button>
    </Form>
  );
}

EventForm.propTypes = propTypes;

export default EventForm;
