import path from 'path';
import ejs from 'ejs';
import { readFileSync } from 'fs';
import { apiPrefix } from '../config';

export default function(zone) {
  if (!zone) throw new Error('zone is null');

  const str = readFileSync(
    path.join(__dirname, '../views/components/createPanel.ejs'),
    'utf8',
  );
  const html = ejs.compile(str)({
    createHref: `${apiPrefix.page}/new?zoneId=${zone._id}`,
    createText: zone.createText,
  });
  return html;
}
