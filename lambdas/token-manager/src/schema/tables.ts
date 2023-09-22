/**
 * Organization Entries:
 *    pk:    <org_id>
 *    sk:    ORG
 *    pData: <created>
 *    name:  <friendly_name>
 *    pw:    <hash>
 *    salt:  <salt>
 *    ...
 * 
 * API Key Entries:
 *    pk:     <client_id>
 *    sk:     API
 *    pData:  <org_id>:<api>
 *    sData:  <api>:<created>
 *    api:    the API ID
 *    secretHash:     <hash>
 *    salt:   <salt>
 *    scopes: <scopes>,
 *    org:    <org_id>
 *    ...
 */
const apiKeySchema = {
    AttributeDefinitions: [
      {
        AttributeName: 'pk',
        AttributeType: 'S'
      },
      {
        AttributeName: 'sk',
        AttributeType: 'S'
      },
      {
        AttributeName: 'pData',
        AttributeType: 'S'
      },
      {
        AttributeName: 'sData',
        AttributeType: 'S'
      }
    ],
    KeySchema: [
      {
        AttributeName: 'pk',
        KeyType: 'HASH'
      },
      {
        AttributeName: 'sk',
        KeyType: 'RANGE'
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 10,
      WriteCapacityUnits: 5
    },
    GlobalSecondaryIndexes: [
      {
        IndexName: 'sk-pData',
        KeySchema: [
          {
            AttributeName: 'sk',
            KeyType: 'HASH'
          },
          {
            AttributeName: 'pData',
            KeyType: 'RANGE'
          }
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 10,
          WriteCapacityUnits: 5
        },
        Projection: {
          ProjectionType: 'ALL'
        }
      }
    ]
  };
  
  /**
   * Token entries:
   *    pk:   <auth_token>
   *    sk:   <client_id>
   *    ttl:  <timestamp>
   *    api:  <api_id>
   *    scp:  <scopes>
   */
  const authTokenSchema = {
    AttributeDefinitions: [
      {
        AttributeName: 'pk',
        AttributeType: 'S'
      },
      {
        AttributeName: 'sk',
        AttributeType: 'S'
      }
    ],
    KeySchema: [
      {
        AttributeName: 'pk',
        KeyType: 'HASH'
      },
      {
        AttributeName: 'sk',
        KeyType: 'RANGE'
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 10,
      WriteCapacityUnits: 5
    },
    TimeToLiveSpecification: {
      AttributeName: 'ttl',
      Enabled: true
    }
  };
  
  export default {
    apiKeySchema,
    authTokenSchema,
  };
  