export const uiSchema = {
  name: {
    'ui:widget': 'customTextWidget',
    'ui:options': {
      className: 'form-group co-create-route__name',
    },
    'ui:help': 'A unique name for the HTTP Proxy within the project.',
  },
  ingressClassName: {
    'ui:widget': 'customDropdownWidget',
    'ui:options': {
      className: 'form-group co-create-route__path',
    },
    'ui:help': 'HTTP Proxy type',
  },

  fqdn: {
    'ui:widget': 'customTextWidget',
    'ui:options': {
      className: 'form-group co-create-route__path',
    },
    'ui:help': 'Hostname for the HTTPProxy (required)',
  },
  prefix: {
    'ui:widget': 'customTextWidget',
    'ui:options': {
      className: 'form-group co-create-route__path',
    },
    'ui:help':
      'Path that the router watches to HTTP Proxy traffic to the service.',
  },

  services: {
    items: {
      name: {
        'ui:widget': 'customDropdownWidget',
        'ui:options': {
          className: 'form-group',
          placeholder: 'Select a service',
        },
      },
      port: {
        'ui:widget': 'customDropdownWidget',
        'ui:options': {
          className: 'form-group co-create-route__path',
        },
        'ui:help': 'Target port for traffic.',
      },
      weight: {
        'ui:widget': 'customTextWidget',
        'ui:options': {
          className: 'form-group',
        },
        'ui:help':
          'A number between 0 and 255 that depicts relative weight compared with other targets.',
      },
      subjectName: {
        'ui:widget': 'customTextWidget',
        'ui:options': {
          className: 'form-group',
        },
        'ui:help':
          'To verify the backend endpoint`s identity, you will need a CA certificate and a Subject Name.',
      },
      caSecret: {
        'ui:widget': 'customDropdownWidget',
        'ui:options': {
          className: 'form-group co-create-route__path',
        },
        'ui:help': 'Only TLS-type secrets are allowed for selection.',
      },
    },
  },
  conditional: {
    'ui:widget': 'checkbox',
    termination: {
      'ui:widget': 'customDropdownWidget',
      'ui:help':
        'Routes can be secured using several TLS termination types for serving certificates.',
      'ui:options': {
        className: 'form-group co-create-route__path',
      },
    },
    secrets: {
      'ui:widget': 'customDropdownWidget',
      'ui:help': 'Only TLS-type secrets are allowed for selection.',
      'ui:options': {
        className: 'form-group co-create-route__path',
      },
    },
  },
};
