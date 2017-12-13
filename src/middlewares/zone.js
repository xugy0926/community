import R from 'ramda';
import { ZoneProxy } from '../proxy';
import getObjById from '../functions/getObjById';

export default (req, res, next) => {
  const buildHref = R.map(function(item) {
    item = item.toObject();
    item.href = `zone?zoneId=${item._id}`;
    item._id = item._id.toString();
    return item;
  });

  ZoneProxy.find({ deleted: false, enable: true })
    .then(buildHref)
    .then(zones => {
      res.locals.zones = zones;
      res.locals.navs = zones;
      return zones;
    })
    .then(zones => {
      const zoneId =
        req.query.zoneId || req.body.zoneId || req.params.zoneId || '';
      if (zoneId) {
        res.locals.zone = getObjById(zoneId)(zones);
      }

      next();
    });
};
