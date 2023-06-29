from celery.schedules import crontab
from flask_appbuilder.security.manager import AUTH_OAUTH
#from custom_sso_security_manager import CustomSsoSecurityManager

# Set the authentication type to OAuth
AUTH_TYPE = AUTH_OAUTH

OAUTH_PROVIDERS = [
    {   'name':'azure',
        'token_key':'access_token', # Name of the token in the response of access_token_url
        'icon':'fa-windows',   # Icon for the provider
        'remote_app': {
            'client_id':'1f410551-6168-4cde-872d-b422dc04519b',  # Client Id (Identify Superset application)
            'client_secret':'I.A8Q~CDdU4H4Hrq-_MXoa9qNQaLwWPwMXIT3bML', # Secret for this Client Id (Identify Superset application)
            'api_base_url':'https://login.microsoftonline.com/70c318a8-f4bd-4995-9bb9-e4b66fb73edf/oauth2',
            'client_kwargs':{
                'scope': 'User.read name prefered_username email profile upn',               # Scope for the Authorization
                'resource': '1f410551-6168-4cde-872d-b422dc04519b'
            },
            'request_token_url': None,
            'access_token_url':'https://login.microsoftonline.com/70c318a8-f4bd-4995-9bb9-e4b66fb73edf/oauth2/token',
            'authorize_url':'https://login.microsoftonline.com/70c318a8-f4bd-4995-9bb9-e4b66fb73edf/oauth2/authorize'
        }
    }
]

# Will allow user self registration, allowing to create Flask users from Authorized User
AUTH_USER_REGISTRATION = True

# The default user self registration role
#AUTH_USER_REGISTRATION_ROLE = "Public"
AUTH_USER_REGISTRATION_ROLE = "Alpha"

# Replace users database roles each login with those received from OAUTH/LDAP
AUTH_ROLES_SYNC_AT_LOGIN = True

# A mapping from LDAP/OAUTH group names to FAB roles
#AUTH_ROLES_MAPPING = {
    # For OAUTH
    #"f2865c33-0e85-4ea6-9592-0adef9363973": ["Admin"],
    # "ADMIN_GROUP_NAME": ["Admin"],
    # For LDAP
    # "cn=User,ou=groups,dc=example,dc=com": ["User"],
    # "cn=Admin,ou=groups,dc=example,dc=com": ["Admin"],
#}

# Self registration role based on user info
AUTH_USER_REGISTRATION_ROLE_JMESPATH = "contains(['f2865c33-0e85-4ea6-9592-0adef9363973'], idTokenClaims.groups) && 'Admin' || 'Gamma'"


#CUSTOM_SECURITY_MANAGER = CustomSsoSecurityManager

ENABLE_PROXY_FIX = True
#PROXY_FIX_CONFIG = {"x_for": 1, "x_proto": 1, "x_host": 1, "x_port": 0, "x_prefix": 1}

FEATURE_FLAGS = {
    "ALERT_REPORTS": True,

    # Configuration for scheduling queries from SQL Lab. This information is
    # collected when the user clicks "Schedule query", and saved into the `extra`
    # field of saved queries.
    # See: https://github.com/mozilla-services/react-jsonschema-form
    'SCHEDULED_QUERIES': {
        'JSONSCHEMA': {
            'title': 'Schedule',
            'description': (
                'In order to schedule a query, you need to specify when it '
                'should start running, when it should stop running, and how '
                'often it should run. You can also optionally specify '
                'dependencies that should be met before the query is '
                'executed. Please read the documentation for best practices '
                'and more information on how to specify dependencies.'
            ),
            'type': 'object',
            'properties': {
                'output_table': {
                    'type': 'string',
                    'title': 'Output table name',
                },
                'start_date': {
                    'type': 'string',
                    'title': 'Start date',
                    # date-time is parsed using the chrono library, see
                    # https://www.npmjs.com/package/chrono-node#usage
                    'format': 'date-time',
                    'default': 'tomorrow at 9am',
                },
                'end_date': {
                    'type': 'string',
                    'title': 'End date',
                    # date-time is parsed using the chrono library, see
                    # https://www.npmjs.com/package/chrono-node#usage
                    'format': 'date-time',
                    'default': '9am in 30 days',
                },
                'schedule_interval': {
                    'type': 'string',
                    'title': 'Schedule interval',
                },
                'dependencies': {
                    'type': 'array',
                    'title': 'Dependencies',
                    'items': {
                        'type': 'string',
                    },
                },
            },
        },
        'UISCHEMA': {
            'schedule_interval': {
                'ui:placeholder': '@daily, @weekly, etc.',
            },
            'dependencies': {
                'ui:help': (
                    'Check the documentation for the correct format when '
                    'defining dependencies.'
                ),
            },
        },
        'VALIDATION': [
            # ensure that start_date <= end_date
            {
                'name': 'less_equal',
                'arguments': ['start_date', 'end_date'],
                'message': 'End date cannot be before start date',
                # this is where the error message is shown
                'container': 'end_date',
            },
        ],
        # link to the scheduler; this example links to an Airflow pipeline
        # that uses the query id and the output table as its name
        'linkback': (
            'https://airflow.example.com/admin/airflow/tree?'
            'dag_id=query_${id}_${extra_json.schedule_info.output_table}'
        )
    }
}

REDIS_HOST = "redis"
REDIS_PORT = "6379"

class CeleryConfig:
    BROKER_URL = 'redis://%s:%s/0' % (REDIS_HOST, REDIS_PORT)
    CELERY_IMPORTS = ('superset.sql_lab', "superset.tasks", "superset.tasks.thumbnails", )
    CELERY_RESULT_BACKEND = 'redis://%s:%s/0' % (REDIS_HOST, REDIS_PORT)
    CELERYD_PREFETCH_MULTIPLIER = 10
    CELERY_ACKS_LATE = True
    CELERY_ANNOTATIONS = {
        'sql_lab.get_sql_results': {
            'rate_limit': '100/s',
        },
        'email_reports.send': {
            'rate_limit': '1/s',
            'time_limit': 600,
            'soft_time_limit': 600,
            'ignore_result': True,
        },
    }
    CELERYBEAT_SCHEDULE = {
        'reports.scheduler': {
            'task': 'reports.scheduler',
            'schedule': crontab(minute='*', hour='*'),
        },
        'reports.prune_log': {
            'task': 'reports.prune_log',
            'schedule': crontab(minute=0, hour=0),
        },
    }
CELERY_CONFIG = CeleryConfig

SCREENSHOT_LOCATE_WAIT = 100
SCREENSHOT_LOAD_WAIT = 600

# Slack configuration
SLACK_API_TOKEN = "xoxb-"

# Email configuration
SMTP_HOST = "173.194.76.108" #change to your host
SMTP_STARTTLS = True
SMTP_SSL = False
SMTP_USER = "twxsset@gmail.com"
SMTP_PORT = 587 # your port eg. 587
SMTP_PASSWORD = "fnnahmrhjomqsoje"
SMTP_MAIL_FROM = "twxsset@gmail.com"

# WebDriver configuration
# If you use Firefox, you can stick with default values
# If you use Chrome, then add the following WEBDRIVER_TYPE and WEBDRIVER_OPTION_ARGS
WEBDRIVER_TYPE = "chrome"
WEBDRIVER_OPTION_ARGS = [
    "--force-device-scale-factor=2.0",
    "--high-dpi-support=2.0",
    "--headless",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-extensions",
]

# This is for internal use, you can keep http
WEBDRIVER_BASEURL="http://superset-web:8088"
# This is the link sent to the recipient, change to your domain eg. https://superset.mydomain.com
WEBDRIVER_BASEURL_USER_FRIENDLY="http://localhost:8088"
SQLALCHEMY_DATABASE_URI = 'postgresql://superset:superset@postgres/superset'
SECRET_KEY = "RaQqtPF5Q9Q772hmP1MdwHVplZe+DwL8OlFH9M741kTXEFCoaw8VBgZB"

