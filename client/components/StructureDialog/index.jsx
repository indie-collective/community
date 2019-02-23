import React, { useState } from 'react';
import { useMutation } from 'urql';
import {
  Dialog,
  Pane,
  SegmentedControl,
  TextInput,
  TextInputField,
  Textarea,
  Autocomplete,
} from 'evergreen-ui';

import { countryOptions } from './countries';

const createStructure = `
  mutation(
    $type: StructureType!
    $name: String!
    $about: String!
    $country: String!
    $city: String!
  ) {
    createStructure(
      type: $type
      name: $name
      about: $about
      location: {
        country: $country
        city: $city
      }
    ) {
      type
      name
      about
      location {
        country
        city
      }
    }
  }
`

const structureTypes = [
  { label: 'studio', value: 'STUDIO' },
  { label: 'association', value: 'ASSOCIATION' },
  { label: 'organisation', value: 'ORGANISATION' },
];

const StructureDialog = ({ visible, onClose }) => {

  const [type, setType] = useState('');
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');

  const [res, executeMutation] = useMutation(createStructure)

  return (
    <Dialog
      isShown={visible}
      title="Create Structure"
      onConfirm={() => {
        executeMutation({ type, name, about, country, city })
          .then(() => {
            onClose();
          });
      }}
      confirmLabel="Create structure"
    >
      <Pane>
        <SegmentedControl
          options={structureTypes}
          value={type}
          onChange={value => setType(value)}
        />
        <br />
        <TextInputField
          label="Name"
          placeholder="Name…"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <Textarea
          placeholder="About…"
          value={about}
          onChange={e => setAbout(e.target.value)}
        />
        <br />
        <br />
        <Autocomplete
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
        <br />
        <TextInputField
          label="City"
          placeholder="City"
          value={city}
          onChange={e => setCity(e.target.value)}
        />
      </Pane>
    </Dialog>
  );
}


export default StructureDialog;
