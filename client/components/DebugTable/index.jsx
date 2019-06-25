import React from 'react';

const DebugTable = ({ keys, data }) => (
  <table className="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
    <thead>
      <tr>
        {keys.map(key => (
          <th key={key}>{key}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {data.map((d, i) => (
        <tr key={i}>
          {keys.map(key => (
            <td key={key}>{d[key]}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

export default DebugTable;
