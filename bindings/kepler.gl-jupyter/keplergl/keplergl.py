import ipywidgets as widgets
from pkg_resources import resource_string
from traitlets import Unicode, Dict, Int, validate, TraitError
import pandas as pd
import geopandas
import shapely.wkt
import json
from ._version import EXTENSION_SPEC_VERSION

from functools import wraps

def yield_for_change(widget, attribute):
    """Pause a generator to wait for a widget change event.

    This is a decorator for a generator function which pauses the generator on yield
    until the given widget attribute changes. The new value of the attribute is
    sent to the generator and is the value of the yield.
    """
    def f(iterator):
        @wraps(iterator)
        def inner():
            i = iterator()
            def next_i(change):
                try:
                    i.send(change.new)
                except StopIteration as e:
                    widget.unobserve(next_i, attribute)
            widget.observe(next_i, attribute)
            # start the generator
            next(i)
        return inner
    return f

documentation = 'https://docs.kepler.gl/docs/keplergl-jupyter'
def _df_to_dict(df):
    ''' Create an input dict for Kepler.gl using a DataFrame object

    Inputs:
    - df: a DataFrame object

    Returns:
    - dictionary: a dictionary variable that can be used in Kepler.gl

    '''
    return df.to_dict('split')

def _gdf_to_dict(gdf):
    ''' Create an input dict for kepler.gl using a GeoDataFrame object

    Inputs:
    - gdf: a GeoDataFrame object

    Returns:
    - dictionary: a dictionary variable that can be used in Kepler.gl
    '''
    # reproject to 4326 if needed
    if gdf.crs and not gdf.crs == 4326:
        gdf = gdf.to_crs(4326)

    # get name of the geometry column
    # will cause error if data frame has no geometry column
    name = gdf.geometry.name

    # convert geodataframe to dataframe
    df = pd.DataFrame(gdf)
    # convert geometry to wkt
    df[name] = df.geometry.apply(lambda x: shapely.wkt.dumps(x))

    return _df_to_dict(df)

def _normalize_data(data):
    if isinstance(data, pd.DataFrame):
        return _gdf_to_dict(data) if isinstance(data, geopandas.GeoDataFrame) else _df_to_dict(data)
    return data

def data_to_json(data, manager):
    '''Serialize a Python date object.
    Attributes of this dictionary are to be passed to the JavaScript side.
    '''

    if data is None:
        return None
    else:
        if type(data) is not dict:
            print(data)
            raise Exception('data type incorrect expecting a dictionary mapping from data id to value, but got {}'.format(type(data)))
            return None
        else:
            dataset = {}
            for key, value in data.items():
                normalized = _normalize_data(value)
                dataset.update({key: normalized})

            return dataset

def data_from_json(js, manager):
    '''Deserialize a Javascript date.'''
    return js

data_serialization = {
    'from_json': data_from_json,
    'to_json': data_to_json
}

class TraitError(Exception):
    pass

class DataException(TraitError):
    pass

@widgets.register
class KeplerGl(widgets.DOMWidget):
    """An example widget."""
    _view_name = Unicode('KeplerGlView').tag(sync=True)
    _model_name = Unicode('KeplerGlModal').tag(sync=True)
    _view_module = Unicode('keplergl-jupyter').tag(sync=True)
    _model_module = Unicode('keplergl-jupyter').tag(sync=True)
    _view_module_version = Unicode(EXTENSION_SPEC_VERSION).tag(sync=True)
    _model_module_version = Unicode(EXTENSION_SPEC_VERSION).tag(sync=True)
    value = Unicode('Hello World!').tag(sync=True)

    data = Dict({}).tag(sync=True, **data_serialization)
    config = Dict({}).tag(sync=True)
    height = Int(400).tag(sync=True)
    _exported_map = Dict({}).tag(sync=True)

    def __init__(self, **kwargs):
        super(KeplerGl, self).__init__(**kwargs)
        print('User Guide: {}'.format(documentation))

    @validate('data')
    def _validate_data(self, proposal):
        '''Validate data input.

        Makes sure data is a dict, and each value should be either a df, a geojson dictionary / string or csv string
        layers list.
        '''

        if type(proposal.value) is not dict:
            raise DataException('[data type error]: Expecting a dictionary mapping from id to value, but got {}'.format(type(proposal.value)))

        else:
            for key, value in proposal.value.items():
                if not isinstance(value, pd.DataFrame) and (type(value) is not str) and (type(value) is not dict):
                     raise DataException('[data type error]: value of {} should be a DataFrame, a Geojson Dictionary or String, a csv String, but got {}'.format(key, type(value)))

        return proposal.value

    def add_data(self, data, name="unnamed"):
        ''' Send data to Voyager

        Inputs:
        - data string, can be a csv string or json string
        - name string

        Example of use:
            keplergl.add_data(data_string, name="data_1")
        '''

        normalized = _normalize_data(data)
        copy = self.data.copy()
        copy.update({name: normalized})

        self.data = copy

    def _repr_html_(self, data=None, config=None, read_only=False, center_map=False):
        ''' Return current map in an html encoded string

        Inputs:
        - data: a data dictionary {"name": data}, if not provided, will use current map data
        - config: map config dictionary, if not provided, will use current map config
        - read_only: if read_only is True, hide side panel to disable map customization

        Returns:
        - a html encoded string

        Example of use:
            # this will save map with provided data and config
            keplergl._repr_html_(data={"data_1": df}, config=config)

            # this will save current map
            keplergl._repr_html_()

        '''
        keplergl_html = resource_string(__name__, 'static/keplergl.html').decode('utf-8')
        # find open of body
        k = keplergl_html.find("<body>")

        data_to_add = data_to_json(self.data, None) if data == None else data_to_json(data, None)
        config_to_add = self.config if config == None else config

        # for key in data_to_add:
        #     print(type(data_to_add[key]))

        keplergl_data = json.dumps({"config": config_to_add, "data": data_to_add, "options": {"readOnly": read_only, "centerMap": center_map}})

        cmd = """window.__keplerglDataConfig = {};""".format(keplergl_data)
        frame_txt = keplergl_html[:k] + "<body><script>" + cmd + "</script>" + keplergl_html[k+6:]

        return frame_txt.encode('utf-8')

    def save_to_html(self, data=None, config=None, file_name='keplergl_map.html', read_only=False, center_map=False):
        ''' Save current map to an interactive html

        Inputs:
        - data: a data dictionary {"name": data}, if not provided, will use current map data
        - config: map config dictionary, if not provided, will use current map config
        - file_name: the html file name, default is keplergl_map.html
        - read_only: if read_only is True, hide side panel to disable map customization

        Returns:
        - an html file will be saved to your notebook

        Example of use:
            # this will save map with provided data and config
            keplergl.save_to_html(data={"data_1": df}, config=config, file_name='first_map.html')

            # this will save current map
            keplergl.save_to_html(file_name='first_map.html')

        '''
        frame_txt = self._repr_html_(data=data, config=config, read_only=read_only, center_map=center_map)

        with open(file_name, 'wb') as f:
            f.write(frame_txt)

        print("Map saved to {}!".format(file_name))

    def save_to_json(self):
        self.send('export_map')
        exported_map = {}

        @yield_for_change(self, '_exported_map')
        def f():
            for i in range(1):
                print('did workkk %s'%i)
                exported_map = yield
                print("changed!")
        f()
        return exported_map

