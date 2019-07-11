import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Button } from 'react-bootstrap';

import CountrySelect from 'components/CountrySelect';

const structureTypes = [
  { label: 'studio', value: 'STUDIO' },
  { label: 'association', value: 'ASSOCIATION' },
  { label: 'organisation', value: 'ORGANISATION' },
];

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

const StructureForm = ({ visible, onClose }) => {
  const [type, setType] = useState(structureTypes[0].value);
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name, about, startAt, endAt, structures, country, city });
      }}
    >
      <Form.Group controlId="structure.type">
        <Form.Label>Type</Form.Label>
        <Form.Check 
          custom
          type="radio"
          id="structure.type"
          label="What type of structure?"
        />
      </Form.Group>

      <Form.Group controlId="structure.name">
        <Form.Label>Name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <Form.Text className="text-muted">
          What is this {type.toLowerCase()} called?
        </Form.Text>
      </Form.Group>

      <RadioGroup
        label="What type of structure?"
        value={type}
        options={structureTypes}
        onChange={value => setType(value)}
      />
      <br />
      <TextInputField
        label={`What is this ${type.toLowerCase()} called?`}
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <Label
        htmlFor="about"
        marginBottom={4}
        display="block"
      >
        Tell us a bit more…
      </Label>
      <Textarea
        id="about"
        placeholder="Now, this is a story all about how my life got flipped-turned upside down…"
        value={about}
        onChange={e => setAbout(e.target.value)}
      />
      <br />
      <br />
      <Label
        htmlFor="country"
        marginBottom={4}
        display="block"
      >
        Where in the world…?
      </Label>
      <Pane display="flex">
        <Autocomplete
          id="country"
          label="country"
          items={countryOptions.map(d => d.text)}
          value={country}
          onChange={value => setCountry(value)}
        >
          {(props) => {
            const { getInputProps, getRef, inputValue, openMenu } = props
            return (
              <TextInput
                placeholder="Country"
                value={inputValue}
                innerRef={getRef}
                {...getInputProps({
                  onFocus: () => {
                    openMenu()
                  }
                })}
              />
            )
          }}
        </Autocomplete>
        <TextInput
          placeholder="City"
          value={city}
          onChange={e => setCity(e.target.value)}
        />
      </Pane>
    </Form>
  );
}

StructureForm.propTypes = propTypes;

export default StructureForm;
