import React, { useState } from 'react';
import { useMutation } from 'urql';
import {
  Dialog,
  Pane,
  RadioGroup,
  TextInput,
  Label,
  TextInputField,
  Textarea,
  Autocomplete,
} from 'evergreen-ui';

import { countryOptions } from '../countries';

import createStructureMutation from '../../gql/createStructure';

const structureTypes = [
  { label: 'studio', value: 'STUDIO' },
  { label: 'association', value: 'ASSOCIATION' },
  { label: 'organisation', value: 'ORGANISATION' },
];

const StructureDialog = ({ visible, onClose }) => {

  const [type, setType] = useState(structureTypes[0].value);
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');

  const createStructure = useMutation(createStructureMutation)[1];

  return (
    <Dialog
      isShown={visible}
      title="Add structure"
      onConfirm={() => {
        createStructure({ type, name, about, country, city })
          .then(() => {
            onClose();
          });
      }}
      confirmLabel={`Add ${type.toLowerCase()}`}
    >
      <Pane>
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
      </Pane>
    </Dialog>
  );
}


export default StructureDialog;
