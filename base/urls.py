from django.urls import path
from . import views

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', views.home, name='home'),
    path('records/', views.records, name='records'),
    path('booking/', views.booking, name='booking'),
    path('adminpage/', views.admin, name='admin'),
    
    # Upload face photo - must be before the generic pattern
    path('upload_face_photo/', views.upload_face_photo, name='upload_face_photo'),
    
    # Admin specific URLs
    path('adminpage/user/edit/<int:user_id>/', views.edit_user, name='edit_user'),
    path('adminpage/user/delete/<int:user_id>/', views.delete_user, name='delete_user'),
    path('adminpage/person/delete/<int:user_id>/', views.delete_person, name='delete_person'),
    path('adminpage/status/delete/<int:user_id>/', views.delete_status, name='delete_status'),
    path('adminpage/image/delete/<int:user_id>/', views.delete_image, name='delete_image'),

    # Authentication URLs
    path('login/', views.loginPage, name='login'),
    path('signup/', views.signupPage, name='signup'),
    path('register/', views.registerPage, name='register'),
    path('logout/', views.logoutUser, name='logout'),
    path('verifyEmail/', views.verifyEmail, name='verifyEmail'),
    path('verify/', views.verifyPage, name='verify'),
    
    # Detection URLs
    path('detected_image/', views.detected_image, name='detected_image'),
    path('detection_status/', views.detection_status, name='detection_status'),
    path('start_detection/', views.start_detection, name='start_detection'),
    path('stop_detection/', views.stop_detection, name='stop_detection'),
    
    # Other URLs
    path('calendar/', views.calendar_view, name='calendar'),
    path('download_report/', views.download_health_report, name='download_report'),
    
    # API URLs
    path('api/admin-stats/', views.get_admin_stats, name='admin_stats'),
    path('api/test-data/', views.test_data, name='test_data'),
    path('api/health-status/', views.get_health_status_by_month, name='health_status'),
    path('api/daily-health-details/', views.get_daily_health_details, name='daily_health_details'),
    path('api/monthly-health-percentage/', views.monthly_health_percentage, name='monthly_health_percentage'),
    path('api/health-stats/', views.health_stats, name='health_stats'),
    path('api/monthly_health_alerts/', views.monthly_health_alerts, name='monthly_health_alerts'),
    
    # Generic admin pattern - must be last to avoid conflicts
    path('<str:page_name>/partial/', views.adminPage),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)