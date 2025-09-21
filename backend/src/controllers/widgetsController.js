import Widget from '../models/Widget.js';
import { getWeatherForLocation } from '../services/weatherService.js';

export async function listWidgets(req, res, next) {
  try {
    const widgets = await Widget.find({}).sort({ createdAt: -1 }).lean();
    res.json(widgets);
  } catch (error) {
    next(error);
  }
}

export async function createWidget(req, res, next) {
  try {
    const { location } = req.body || {};
    if (!location || typeof location !== 'string') {
      const err = new Error('Ungültiger Ort');
      err.status = 400;
      throw err;
    }
    const widget = await Widget.create({ location: location.trim() });
    res.status(201).json(widget);
  } catch (error) {
    next(error);
  }
}

export async function deleteWidget(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await Widget.findByIdAndDelete(id);
    if (!deleted) {
      const err = new Error('Widget nicht gefunden');
      err.status = 404;
      throw err;
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function getWidgetWeather(req, res, next) {
  try {
    const { id } = req.params;
    const widget = await Widget.findById(id);
    if (!widget) {
      const err = new Error('Widget nicht gefunden');
      err.status = 404;
      throw err;
    }
    const data = await getWeatherForLocation(widget.location);
    res.json({ widgetId: id, location: widget.location, data });
  } catch (error) {
    next(error);
  }
}

export async function getWeatherByQuery(req, res, next) {
  try {
    const { location } = req.query;
    const data = await getWeatherForLocation(location);
    res.json(data);
  } catch (error) {
    next(error);
  }
}


