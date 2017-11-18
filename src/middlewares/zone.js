import { ZoneProxy } from '../proxy';

export const zoneRequired = async (req, res, next) => {
  const zoneId = req.query.zoneId || req.body.zoneId || req.params.zoneId || '';
  if (!zoneId) {
    next();
    return;
  }

  const doc = await ZoneProxy.findOneById(zoneId);
  doc.href = `zone?zoneId=${doc._id}`;

  if (doc) {
    res.locals.zone = doc;
  }

  next();
}

export const zonesRequired = async (req, res, next) => {
  const zones = await ZoneProxy.find({ deleted: false, enable: true });

  zones.forEach(doc => {
    const d = doc;
    d.href = `zone?zoneId=${doc._id}`;
    return d;
  });

  if (zones) {
    res.locals.zones = zones;
    res.locals.navs = zones;
  }

  next();
}
