import * as tools from '../common/tools';

export default function(schema) {
  schema.methods.createAtAgo = function() {
    return tools.formatDate(this.createAt, true);
  };

  schema.methods.updateAtAgo = function() {
    return tools.formatDate(this.updateAt, true);
  };
}