from django.shortcuts import render, redirect
from django.core.mail import send_mail
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.http import StreamingHttpResponse
from django.http import JsonResponse, HttpResponse
from django.core.files.base import ContentFile
from django.db.models.functions import ExtractMonth
from django.db.models import Count
from django.core.paginator import Paginator
from django.template.loader import render_to_string
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .forms import CustomUserCreationForm
from .models import User, person, healthStatus, alertImage, Booking
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
import io
import random
import cv2
import os
import numpy as np
from ultralytics import YOLO
import insightface
import time
from datetime import datetime
from django.utils.timezone import make_aware, is_naive, now
import calendar




def loginPage(request):
    page = 'login'
    logged_in = False

    username_error = ''
    password_error = ''

    if request.user.is_authenticated:
        return redirect('home')

    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        try:
            user_obj = User.objects.get(username=username)
            if user_obj.check_password(password):
                login(request, user_obj)
                request.session.set_expiry(3600)
                return redirect('home')
            else:
                password_error = 'Password incorrect.'
        except User.DoesNotExist:
            username_error = 'User not found.'

    context = {
        'page': page,
        'logged_in': logged_in,
        'username_error': username_error,
        'password_error': password_error,
    }
    return render(request, 'login.html', context)

def verifyEmail(request):
    page = 'verifyEmail'
    logged_in = False
    form = CustomUserCreationForm()
    if request.method == 'POST':
        email = request.POST.get('email')
        if User.objects.filter(email=email).exists():
            messages.error(request, 'This email is already registered.')
        else:
            request.session['register_email'] = email
            request.session['from_email'] = True
            request.session.set_expiry(300)
            return redirect('verify')
    context = {'page':page, 'form':form, 'logged_in':logged_in}
    return render(request, 'base/login_register.html', context)

def verifyPage(request):
    page = 'verify'
    logged_in = False
    # check the user is come from verify email page or not
    if not request.session.get('from_email'):
        return redirect('home' if request.user.is_authenticated else 'login')

    email = request.session.get('register_email')

    if request.method == 'GET':
        verifyCode = str(random.randint(100000, 999999))
        request.session['code'] = verifyCode

        send_mail(
                'Your verification code',
                f'Your verification code is {verifyCode}',
                None,  # send
                [email],  # receive
                fail_silently=False,
            )
    
    if request.method == 'POST':
        code = request.POST.get('code')
        if code == request.session.get('code'):
            request.session.pop('code')
            request.session['verify'] = True
            return redirect('register')
        
    context = {'email':email, 'page':page, 'logged_in':logged_in}
    return render(request, 'base/login_register.html', context)


def signupPage(request):
    page = 'signup'
    logged_in = False
    
    if request.user.is_authenticated:
        return redirect('home')
    
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')
        
        # 驗證密碼是否一致
        if password != confirm_password:
            context = {
                'page': page, 
                'logged_in': logged_in, 
                'error': 'Passwords do not match',
                'username': username,
                'email': email
            }
            return render(request, 'signup.html', context)
        
        # 檢查用戶名是否已存在
        if User.objects.filter(username=username).exists():
            context = {
                'page': page, 
                'logged_in': logged_in, 
                'error': 'Username already exists',
                'username': username,
                'email': email
            }
            return render(request, 'signup.html', context)
        
        # 檢查郵箱是否已存在
        if User.objects.filter(email=email).exists():
            context = {
                'page': page, 
                'logged_in': logged_in, 
                'error': 'Email already exists',
                'username': username,
                'email': email
            }
            return render(request, 'signup.html', context)
        
        # 創建新用戶
        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password
            )
            messages.success(request, 'Account created successfully! Please log in.')
            return redirect('login')
        except Exception as e:
            context = {
                'page': page, 
                'logged_in': logged_in, 
                'error': 'An error occurred while creating your account',
                'username': username,
                'email': email
            }
            return render(request, 'signup.html', context)
    
    context = {'page': page, 'logged_in': logged_in}
    return render(request, 'signup.html', context)

def registerPage(request):
    page = 'register'
    logged_in = False
    if request.session.get('verify'):
        form = CustomUserCreationForm()
        if request.method == 'POST':
            form = CustomUserCreationForm(request.POST)
            if form.is_valid():
                user = form.save()
                user.email = request.session.get('register_email')
                user.save()
                request.session.flush()
                return redirect('login')
    else:
        return redirect('home' if request.user.is_authenticated else 'login')

    context = {'form':form, 'page':page, 'logged_in':logged_in}
    return render(request, 'base/login_register.html', context)

def forgotPassword(request):
    page = 'forgot'
    if request.user.is_authenticated:
        return redirect('home')
    context = {}
    return render(request, 'base/', context)

def logoutUser(request):
    logout(request)
    return redirect('home')

def home(request):
    page = 'home'
    if request.user.is_authenticated != True:
        return redirect('login')
    logged_in = True
    context = {'page':page, 'logged_in':logged_in}
    return render(request, 'base/home.html', context)

def admin(request):
    if request.user.is_authenticated != True:
        return redirect('login')
    
    # 暫時註釋掉管理員權限檢查，讓所有用戶都能訪問
    # if request.user.admin == False:
    #     return redirect('home')

    context = {
        'userRecords': User.objects.all().order_by('-date_joined'),
        'personRecords': person.objects.all(),
        'healthRecords': healthStatus.objects.all().order_by('-created'),
        'imageRecords': alertImage.objects.all(),
        'page': 'admin',
        'logged_in': True
    }

    return render(request, 'base/admin/admin.html', context)

def get_admin_stats(request):
    """獲取 admin 頁面的統計數據"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    
    try:
        stats = {
            'userCount': User.objects.count(),
            'healthCount': healthStatus.objects.count(),
            'personCount': person.objects.count(),
            'imageCount': alertImage.objects.count(),
        }
        return JsonResponse(stats)
    except Exception as e:
        return JsonResponse({
            'error': 'Failed to fetch stats',
            'userCount': 0,
            'healthCount': 0,
            'personCount': 0,
            'imageCount': 0
        })

def test_data(request):
    """測試端點，檢查數據庫中的數據"""
    try:
        user_count = User.objects.count()
        health_count = healthStatus.objects.count()
        person_count = person.objects.count()
        image_count = alertImage.objects.count()
        
        # 獲取一些示例數據
        users = list(User.objects.values('id', 'username', 'admin')[:5])
        health_records = list(healthStatus.objects.values('id', 'created')[:5])
        
        return JsonResponse({
            'counts': {
                'users': user_count,
                'health': health_count,
                'persons': person_count,
                'images': image_count
            },
            'sample_users': users,
            'sample_health': health_records,
            'current_user': {
                'authenticated': request.user.is_authenticated,
                'username': request.user.username if request.user.is_authenticated else None,
                'is_admin': getattr(request.user, 'admin', False) if request.user.is_authenticated else False
            }
        })
    except Exception as e:
        return JsonResponse({'error': str(e)})

def adminPage(request, page_name):
    path = 'base/admin/'
    template_map = {
        'user': path + 'admin_user.html',
        'health': path + 'admin_safety.html',
        'image': path + 'admin_image.html',
        'person': path + 'admin_person.html',
    }

    context = {}

    year = request.GET.get('year')
    month = request.GET.get('month')
    status = request.GET.get('status')

    if page_name == 'user':
        queryset = User.objects.all().order_by('-date_joined')

        if year:
            queryset = queryset.filter(date_joined__year=year)
        if month:
            queryset = queryset.filter(date_joined__month=month)
        if status:
            queryset = queryset.filter(username__icontains=status)
        
        paginator = Paginator(queryset, 10)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        
        context = {
            'userRecords': page_obj,
            'year': year,
            'month': month,
            'user_name': status,
        }

    elif page_name == 'health':
        queryset = healthStatus.objects.all().order_by('-created')

        if year:
            queryset = queryset.filter(created__year=year)
        if month:
            queryset = queryset.filter(created__month=month)

        paginator = Paginator(queryset, 10)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)

        context = {
            'healthRecords': page_obj,
            'year': year,
            'month': month,
        }

    elif page_name == 'person':
        queryset = person.objects.all()

        if year:
            queryset = queryset.filter(created__year=year)
        if month:
            queryset = queryset.filter(created__month=month)
        if status:
            queryset = queryset.filter(person__icontains=status)

        paginator = Paginator(queryset, 10)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)

        context = {
            'personRecords': page_obj,
            'year': year,
            'month': month,
            'person_name':status,
        }
    
    elif page_name == 'image':
        queryset = alertImage.objects.all()

        if year:
            queryset = queryset.filter(uploaded__year=year)
        if month:
            queryset = queryset.filter(uploaded__month=month)

        paginator = Paginator(queryset, 10)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)

        context = {
            'imageRecords': page_obj,
            'year': year,
            'month': month,
        }

    return HttpResponse(render_to_string(template_map[page_name], context, request=request))

@csrf_exempt
def edit_user(request, user_id):
    if request.method == "POST":
            user = User.objects.get(id=user_id)
            user.admin = request.POST.get('admin')
            user.email = request.POST.get('email')
            user.gender = request.POST.get('gender')
            user.phone = request.POST.get('phone')
            user.save()
            return JsonResponse({"status": "success"})

@csrf_exempt
def delete_user(request, user_id):
    if request.method == 'POST':
        try:
            user = User.objects.get(id=user_id)
            user.delete()
            return JsonResponse({'status': 'success'})
        except User.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)
    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)

@csrf_exempt
def delete_person(request, person_id):
    if request.method == 'POST':
        try:
            Person = person.objects.get(id=person_id)
            Person.delete()
            return JsonResponse({'status': 'success'})
        except User.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)
    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)

@csrf_exempt
def delete_status(request, health_id):
    if request.method == 'POST':
        try:
            health = healthStatus.objects.get(id=health_id)
            health.delete()
            return JsonResponse({'status': 'success'})
        except healthStatus.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Health record not found'}, status=404)
    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)

@csrf_exempt
def delete_image(request, image_id):
    if request.method == 'POST':
        try:
            image = alertImage.objects.get(id=image_id)
            image.delete()
            return JsonResponse({'status': 'success'})
        except User.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)
    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)


def records(request):
    page = 'records'
    if request.user.is_authenticated != True:
        return redirect('login')
    logged_in = True
    
    months = [(i, name) for i, name in enumerate([
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ], start=1)]
        
    person_name = request.GET.get('person', '').strip()
    date = request.GET.get('date', '').strip()

    records = healthStatus.objects.select_related('person', 'image').order_by('-created')

    if person_name:
        records = records.filter(person__person__icontains=person_name)

    if date:
        records = records.filter(created__date=date)

    paginator = Paginator(records, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'records':page_obj, 
        'page':page, 
        'person_name':person_name, 
        'date':date,
        'months': months,
        'logged_in':logged_in,
        }
    return render(request, 'base/records.html', context)

def booking(request):
    """預約頁面視圖"""
    if not request.user.is_authenticated:
        return redirect('login')
    
    page = 'booking'
    logged_in = True
    success_message = None
    error_message = None
    
    # 預設醫院列表（包含經緯度座標）
    hospitals = [
        {
            'name': 'General Hospital KL',
            'address': 'Jalan Pahang, 53000 Kuala Lumpur',
            'lat': 3.1738,
            'lng': 101.7031,
            'phone': '+603-2615-5555'
        },
        {
            'name': 'Pantai Hospital KL',
            'address': 'Jalan Bukit Pantai, 59100 Kuala Lumpur',
            'lat': 3.1319,
            'lng': 101.6841,
            'phone': '+603-2296-0888'
        },
        {
            'name': 'Prince Court Medical Centre',
            'address': 'No. 39, Jalan Kia Peng, 50450 Kuala Lumpur',
            'lat': 3.1570,
            'lng': 101.7123,
            'phone': '+603-2160-0000'
        },
        {
            'name': 'Sunway Medical Centre',
            'address': 'No. 5, Jalan Lagoon Selatan, 47500 Subang Jaya',
            'lat': 3.0738,
            'lng': 101.6065,
            'phone': '+603-7491-9191'
        }
    ]
    
    if request.method == 'POST':
        try:
            name = request.POST.get('name', '').strip()
            phone = request.POST.get('phone', '').strip()
            hospital = request.POST.get('hospital', '').strip()
            appointment_date = request.POST.get('appointment_date', '').strip()
            appointment_time = request.POST.get('appointment_time', '').strip()
            message = request.POST.get('message', '').strip()
            
            # 驗證必填字段
            if not all([name, phone, hospital, appointment_date, appointment_time]):
                error_message = "Please fill in all required fields."
            else:
                # 創建預約記錄
                booking_record = Booking.objects.create(
                    user=request.user,
                    name=name,
                    phone=phone,
                    hospital=hospital,
                    appointment_date=appointment_date,
                    appointment_time=appointment_time,
                    message=message
                )
                success_message = f"Booking successful! Your appointment at {hospital} on {appointment_date} at {appointment_time} has been confirmed."
                
        except Exception as e:
            error_message = f"An error occurred while processing your booking: {str(e)}"
    
    # 獲取用戶的預約記錄
    user_bookings = Booking.objects.filter(user=request.user).order_by('-created')[:5]
    
    # 獲取今天的日期
    from datetime import date
    today = date.today().strftime('%Y-%m-%d')
    
    context = {
        'page': page,
        'logged_in': logged_in,
        'hospitals': hospitals,
        'success_message': success_message,
        'error_message': error_message,
        'user_bookings': user_bookings,
        'today': today,
    }
    
    return render(request, 'base/booking.html', context)


def calendar_view(request):
    if request.user.is_authenticated != True:
        return redirect('login')
    context = {}
    return render(request, 'base/calendar.html', context)


# ----- calendar -----
def get_health_status_by_month(request):
    year = int(request.GET.get('year'))
    month = int(request.GET.get('month'))

    start_date = datetime(year, month, 1)
    if month == 12:
        end_date = datetime(year + 1, 1, 1)
    else:
        end_date = datetime(year, month + 1, 1)

    if is_naive(start_date):
        start_date = make_aware(start_date)
    if is_naive(end_date):
        end_date = make_aware(end_date)

    records = healthStatus.objects.filter(created__gte=start_date, created__lt=end_date)

    day_status = {}
    for record in records:
        day_str = record.created.astimezone().date().isoformat()  # e.g., "2025-05-02"
        # 檢查是否有健康問題
        has_health_issues = (record.dark_circles != 'none' or 
                           record.lip_type != 'normal' or 
                           record.skin_condition != 'healthy')
        if day_str not in day_status:
            day_status[day_str] = False
        day_status[day_str] = day_status[day_str] or has_health_issues

    return JsonResponse(day_status)

@csrf_exempt
def get_daily_health_details(request):
    """獲取特定日期的詳細健康統計"""
    if request.method == 'GET':
        date_str = request.GET.get('date')
        
        if not date_str:
            return JsonResponse({'error': 'Date parameter is required'}, status=400)
        
        try:
            # 解析日期
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            
            # 獲取該日期的所有健康記錄
            records = healthStatus.objects.filter(created__date=target_date)
            
            # 計算統計
            total_records = records.count()
            
            # 黑眼圈統計 - 分為正常和問題兩類
            dark_circles_none = records.filter(dark_circles='none').count()
            dark_circles_issues = records.filter(dark_circles__in=['mild', 'moderate', 'severe']).count()
            
            # 唇型統計 - 分為正常和問題兩類
            lip_normal = records.filter(lip_type='normal').count()
            lip_issues = records.filter(lip_type__in=['dry', 'chapped', 'pale']).count()
            
            # 皮膚狀況統計 - 分為健康和問題兩類
            skin_healthy = records.filter(skin_condition='healthy').count()
            skin_issues = records.filter(skin_condition__in=['acne', 'dry', 'oily', 'sensitive']).count()
            
            return JsonResponse({
                'date': date_str,
                'total_records': total_records,
                'dark_circles_none': dark_circles_none,
                'dark_circles_issues': dark_circles_issues,
                'lip_normal': lip_normal,
                'lip_issues': lip_issues,
                'skin_healthy': skin_healthy,
                'skin_issues': skin_issues
            })
            
        except ValueError:
            return JsonResponse({'error': 'Invalid date format. Use YYYY-MM-DD'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def monthly_health_percentage(request):
    """獲取月度健康百分比統計"""
    if request.method == 'GET':
        year = int(request.GET.get('year', datetime.now().year))
        month = int(request.GET.get('month', datetime.now().month))
        
        # 獲取該月的所有健康記錄
        records = healthStatus.objects.filter(
            created__year=year,
            created__month=month
        )
        
        total_records = records.count()
        
        if total_records == 0:
            return JsonResponse({
                'year': year,
                'month': month,
                'total_records': 0,
                'dark_circles_percentage': 0,
                'lip_issues_percentage': 0,
                'skin_issues_percentage': 0
            })
        
        # 計算各種健康問題的百分比
        dark_circles_issues = records.exclude(dark_circles='none').count()
        lip_issues = records.exclude(lip_type='normal').count()
        skin_issues = records.exclude(skin_condition='healthy').count()
        
        dark_circles_percentage = round((dark_circles_issues / total_records) * 100, 2)
        lip_issues_percentage = round((lip_issues / total_records) * 100, 2)
        skin_issues_percentage = round((skin_issues / total_records) * 100, 2)
        
        return JsonResponse({
            'year': year,
            'month': month,
            'total_records': total_records,
            'dark_circles_percentage': dark_circles_percentage,
            'lip_issues_percentage': lip_issues_percentage,
            'skin_issues_percentage': skin_issues_percentage
        })
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def monthly_health_alerts(request):
    """獲取月度健康警報統計"""
    year = int(request.GET.get('year', datetime.now().year))
    month = int(request.GET.get('month', datetime.now().month))
    
    start_date = datetime(year, month, 1)
    if month == 12:
        end_date = datetime(year + 1, 1, 1)
    else:
        end_date = datetime(year, month + 1, 1)
    
    if is_naive(start_date):
        start_date = make_aware(start_date)
    if is_naive(end_date):
        end_date = make_aware(end_date)
    
    # 獲取該月的健康記錄
    records = healthStatus.objects.filter(created__gte=start_date, created__lt=end_date)
    
    # 按日期分組統計健康問題
    daily_data = {}
    for record in records:
        day = record.created.astimezone().date().day
        if day not in daily_data:
            daily_data[day] = {
                'dark_circles_issues': 0,
                'lip_issues': 0,
                'skin_issues': 0
            }
        
        if record.dark_circles != 'none':
            daily_data[day]['dark_circles_issues'] += 1
        if record.lip_type != 'normal':
            daily_data[day]['lip_issues'] += 1
        if record.skin_condition != 'healthy':
            daily_data[day]['skin_issues'] += 1
    
    # 準備圖表數據
    days = list(range(1, calendar.monthrange(year, month)[1] + 1))
    dark_circles_data = [daily_data.get(day, {}).get('dark_circles_issues', 0) for day in days]
    lip_data = [daily_data.get(day, {}).get('lip_issues', 0) for day in days]
    skin_data = [daily_data.get(day, {}).get('skin_issues', 0) for day in days]
    
    return JsonResponse({
        'days': days,
        'dark_circles_data': dark_circles_data,
        'lip_data': lip_data,
        'skin_data': skin_data,
        'year': year,
        'month': month
    })
# ----- calendar -----


# ----- Yolo detect & opencv part -----
modelDarkCircles = YOLO("AIModels/DarkCircles.pt") 
modelLipTypes = YOLO("AIModels/Lip_types.pt")
modelSkin = YOLO("AIModels/skin.pt")
modelPerson = insightface.app.FaceAnalysis(providers=['CPUExecutionProvider'])

detection = {
    'person': 'None',
    'dark_circles': 'none',
    'lip_type': 'normal',
    'skin_condition': 'healthy',
}

last_save_time = {}

# Detection control variables
detection_active = False
camera_cap = None

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def detect():
    global detection_active, camera_cap
    
    modelPerson.prepare(ctx_id=-1, det_size=(640, 640))  

    known_names = []
    known_embeddings = []

    recognized_ids = set()

    # ----- Extract facial features from saved photos -----
    for filename in os.listdir('faceData'):
        if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            img_path = os.path.join('faceData', filename)
            img = cv2.imread(img_path)

            faces = modelPerson.get(img)
            if len(faces) > 0:
                embedding = faces[0].embedding
                name = os.path.splitext(filename)[0]
                known_names.append(name)
                known_embeddings.append(embedding)
    # ----- Extract facial features from saved photos -----
            
    threshold = 0.6  

    while True:
        if not detection_active:
            # Return a placeholder frame when detection is not active
            placeholder_frame = np.zeros((480, 640, 3), dtype=np.uint8)
            cv2.putText(placeholder_frame, "Detection Stopped", (200, 240), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            image_bytes = cv2.imencode('.jpg', placeholder_frame)[1].tobytes()
            yield(b'--frame\r\n'
                  b'Content-Type: image/jpeg\r\n\r\n' + image_bytes + b'\r\n')
            time.sleep(0.1)  # Small delay to prevent excessive CPU usage
            continue
        
        # Initialize camera only when detection is active
        if camera_cap is None:
            try:
                # Try different camera indices
                camera_indices = [0, 1, -1]  # Try default, secondary, and auto-detect
                camera_cap = None
                
                for idx in camera_indices:
                    print(f"Trying camera index: {idx}")
                    test_cap = cv2.VideoCapture(idx)
                    
                    if test_cap.isOpened():
                        # Test if we can actually read a frame
                        ret, test_frame = test_cap.read()
                        if ret and test_frame is not None:
                            print(f"Camera index {idx} works successfully")
                            camera_cap = test_cap
                            break
                        else:
                            print(f"Camera index {idx} opened but cannot read frames")
                            test_cap.release()
                    else:
                        print(f"Camera index {idx} failed to open")
                        test_cap.release()
                
                if camera_cap is None:
                    print("Error: No working camera found")
                    # Return error frame
                    error_frame = np.zeros((480, 640, 3), dtype=np.uint8)
                    cv2.putText(error_frame, "No Camera Found", (180, 220), 
                               cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                    cv2.putText(error_frame, "Please check camera connection", (120, 260), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                    image_bytes = cv2.imencode('.jpg', error_frame)[1].tobytes()
                    yield(b'--frame\r\n'
                          b'Content-Type: image/jpeg\r\n\r\n' + image_bytes + b'\r\n')
                    time.sleep(0.1)
                    continue
                else:
                    print("Camera initialized successfully")
                    # Set camera properties for better performance
                    camera_cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                    camera_cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
                    camera_cap.set(cv2.CAP_PROP_FPS, 30)
                    
            except Exception as e:
                print(f"Camera initialization error: {e}")
                # Return error frame
                error_frame = np.zeros((480, 640, 3), dtype=np.uint8)
                cv2.putText(error_frame, "Camera Init Error", (150, 220), 
                           cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                cv2.putText(error_frame, str(e)[:50], (50, 260), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)
                image_bytes = cv2.imencode('.jpg', error_frame)[1].tobytes()
                yield(b'--frame\r\n'
                      b'Content-Type: image/jpeg\r\n\r\n' + image_bytes + b'\r\n')
                time.sleep(0.1)
                continue
        
        ret, frame = camera_cap.read()
        dark_circles = 'none'
        lip_type = 'normal'
        skin_condition = 'healthy'

        if not ret or frame is None:
            print("Error: Could not read frame from camera, attempting to reinitialize...")
            # Try to reinitialize camera
            if camera_cap is not None:
                camera_cap.release()
                camera_cap = None
            
            # Return error frame
            error_frame = np.zeros((480, 640, 3), dtype=np.uint8)
            cv2.putText(error_frame, "Frame Read Error", (150, 220), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            cv2.putText(error_frame, "Reinitializing camera...", (130, 260), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            image_bytes = cv2.imencode('.jpg', error_frame)[1].tobytes()
            yield(b'--frame\r\n'
                  b'Content-Type: image/jpeg\r\n\r\n' + image_bytes + b'\r\n')
            time.sleep(0.5)  # Wait a bit before retrying
            continue

        # ----- Face Recognition Part -----
        faces = modelPerson.get(frame)
        name = "Unknown"
        p = None
        
        for face in faces:
            bbox = face.bbox.astype(int)
            h, w, _ = frame.shape
            x1, y1 = max(0, bbox[0]), max(0, bbox[1])
            x2, y2 = min(w, bbox[2]), min(h, bbox[3])
            embedding = face.embedding

            max_sim = -1
            for i, known_emb in enumerate(known_embeddings):
                sim = cosine_similarity(embedding, known_emb)
                if sim > max_sim:
                    max_sim = sim
                    if sim > threshold:
                        name = known_names[i]

            if name != "Unknown":
                if name not in recognized_ids:
                    p, _ = person.objects.get_or_create(person=name)
                    recognized_ids.add(name)
                else:
                    try:
                        p = person.objects.get(person=name)
                    except person.DoesNotExist:
                        p = None 

            cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), (0, 0, 255), 2)
            cv2.putText(frame, f"{name} {max_sim:.2f}", (bbox[0], bbox[1] - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
        # ----- Face Recognition Part End -----

        frame_copy = frame.copy()
        
        # ----- Health Detection Part -----
        # 黑眼圈檢測
        dark_circle_results = modelDarkCircles(frame)
        if dark_circle_results[0].boxes:
            for box in dark_circle_results[0].boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                label = dark_circle_results[0].names[int(box.cls)]
                conf = float(box.conf)
                
                if conf > 0.5:  # 置信度閾值
                    dark_circles = label
                    cv2.rectangle(frame_copy, (x1, y1), (x2, y2), (0, 0, 255), 2)
                    cv2.putText(frame_copy, f"Dark Circles: {label} {conf:.2f}", (x1, y1 - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
        
        # 唇型檢測
        lip_results = modelLipTypes(frame)
        if lip_results[0].boxes:
            for box in lip_results[0].boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                label = lip_results[0].names[int(box.cls)]
                conf = float(box.conf)
                
                if conf > 0.5:  # 置信度閾值
                    lip_type = label
                    cv2.rectangle(frame_copy, (x1, y1), (x2, y2), (107, 229, 242), 2)
                    cv2.putText(frame_copy, f"Lip Type: {label} {conf:.2f}", (x1, y1 - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (107, 229, 242), 2)
        
        # 皮膚檢測
        skin_results = modelSkin(frame)
        if skin_results[0].boxes:
            for box in skin_results[0].boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                label = skin_results[0].names[int(box.cls)]
                conf = float(box.conf)
                
                if conf > 0.5:  # 置信度閾值
                    skin_condition = label
                    cv2.rectangle(frame_copy, (x1, y1), (x2, y2), (47, 20, 224), 2)
                    cv2.putText(frame_copy, f"Skin: {label} {conf:.2f}", (x1, y1 - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (47, 20, 224), 2)

        global detection
        detection = {
            'person': name,
            'dark_circles': dark_circles,
            'lip_type': lip_type,
            'skin_condition': skin_condition
        }

        if p is not None:
            current_time = time.time()
            last_time = last_save_time.get(name, 0)

            filename = datetime.now().strftime("%Y%m%d_%H%M%S.jpg")

            if current_time - last_time >= 5:
                _, buffer = cv2.imencode(".jpg", frame_copy)
                io_buf = io.BytesIO(buffer)

                img = alertImage.objects.create(
                    name=filename,
                )
                img.image.save(filename, ContentFile(io_buf.getvalue()))
                img.save()

                healthStatus.objects.create(
                    person=p,
                    dark_circles=dark_circles,
                    lip_type=lip_type,
                    skin_condition=skin_condition,
                    image=img
                )

                last_save_time[name] = current_time

        image_bytes = cv2.imencode('.jpg', frame)[1].tobytes()
        yield(b'--frame\r\n'
              b'Content-Type: image/jpeg\r\n\r\n' + image_bytes + b'\r\n')
        
def detected_image(request):
    return StreamingHttpResponse(detect(), content_type='multipart/x-mixed-replace; boundary=frame')

def detection_status(request):
    return JsonResponse(detection)

@csrf_exempt
def start_detection(request):
    global detection_active, camera_cap
    if request.method == 'POST':
        detection_active = True
        return JsonResponse({'status': 'success', 'message': 'Detection started'})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

@csrf_exempt
def stop_detection(request):
    global detection_active, camera_cap
    if request.method == 'POST':
        detection_active = False
        if camera_cap is not None:
            camera_cap.release()
            camera_cap = None
        # Reset detection data
        global detection
        detection = {
            'person': 'None',
            'dark_circles': 'none',
            'lip_type': 'normal',
            'skin_condition': 'healthy',
        }
        return JsonResponse({'status': 'success', 'message': 'Detection stopped'})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})
# ----- Yolo detect part end -----

# chart
def health_stats(request):
    year = now().year

    months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

    # 黑眼圈統計
    dark_circles_data = healthStatus.objects.filter(
        created__year=year,
    ).exclude(dark_circles='none')

    # 唇型問題統計
    lip_issues_data = healthStatus.objects.filter(
        created__year=year,
    ).exclude(lip_type='normal')

    # 皮膚問題統計 - 按不同皮膚狀態分類
    skin_acne_data = healthStatus.objects.filter(
        created__year=year,
        skin_condition='acne'
    )
    
    skin_dry_data = healthStatus.objects.filter(
        created__year=year,
        skin_condition='dry'
    )
    
    skin_oily_data = healthStatus.objects.filter(
        created__year=year,
        skin_condition='oily'
    )
    
    skin_sensitive_data = healthStatus.objects.filter(
        created__year=year,
        skin_condition='sensitive'
    )

    dark_circles_counts = (
        dark_circles_data
        .annotate(month=ExtractMonth('created'))
        .values('month')
        .annotate(count=Count('id'))
        .order_by('month')
    )

    lip_issues_counts = (
        lip_issues_data
        .annotate(month=ExtractMonth('created'))
        .values('month')
        .annotate(count=Count('id'))
        .order_by('month')
    )

    skin_acne_counts = (
        skin_acne_data
        .annotate(month=ExtractMonth('created'))
        .values('month')
        .annotate(count=Count('id'))
        .order_by('month')
    )
    
    skin_dry_counts = (
        skin_dry_data
        .annotate(month=ExtractMonth('created'))
        .values('month')
        .annotate(count=Count('id'))
        .order_by('month')
    )
    
    skin_oily_counts = (
        skin_oily_data
        .annotate(month=ExtractMonth('created'))
        .values('month')
        .annotate(count=Count('id'))
        .order_by('month')
    )
    
    skin_sensitive_counts = (
        skin_sensitive_data
        .annotate(month=ExtractMonth('created'))
        .values('month')
        .annotate(count=Count('id'))
        .order_by('month')
    )

    # 示例數據
    dark_circles_monthly = {
        'January': 5,
        'February': 8,
        'March': 12,
        'April': 3,
        'May': 7
    }
    lip_issues_monthly = {
        'January': 3,
        'February': 6,
        'March': 4,
        'April': 9,
        'May': 5
    }
    
    # 不同皮膚狀態的示例數據
    skin_acne_monthly = {
        'January': 8,
        'February': 12,
        'March': 6,
        'April': 15,
        'May': 9
    }
    skin_dry_monthly = {
        'January': 5,
        'February': 7,
        'March': 10,
        'April': 4,
        'May': 8
    }
    skin_oily_monthly = {
        'January': 12,
        'February': 9,
        'March': 14,
        'April': 7,
        'May': 11
    }
    skin_sensitive_monthly = {
        'January': 3,
        'February': 5,
        'March': 2,
        'April': 6,
        'May': 4
    }
    
    # 可以取消註釋以下代碼來使用真實數據
    # for item in dark_circles_counts:
    #     month_num = item['month'] - 1
    #     month_name = months[month_num]
    #     dark_circles_monthly[month_name] = item['count']

    data = {
        'dark_circles_data': dark_circles_monthly,
        'lip_data': lip_issues_monthly,
        'skin_acne_data': skin_acne_monthly,
        'skin_dry_data': skin_dry_monthly,
        'skin_oily_data': skin_oily_monthly,
        'skin_sensitive_data': skin_sensitive_monthly
    }

    return JsonResponse(data)

# PDF
def download_health_report(request):
    month = request.GET.get('month')
    year = now().year

    if not month or not month.isdigit():
        return HttpResponse("Invalid month", status=400)

    month = int(month)
    month_name = calendar.month_name[month]
    records = healthStatus.objects.filter(created__month=month, created__year=year).select_related('person')

    if not records.exists():
        return JsonResponse({"success": False, "message": "Data not found", "month": month}, status=400)

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []

    # Title
    elements.append(Paragraph(f"Health Status Report - {month_name} {year}", styles['Title']))
    elements.append(Spacer(1, 20))

    # Health Data Table
    table_data = [
        ['Date', 'Time', 'Person', 'Dark Circles', 'Lip Type', 'Skin Condition']
    ]

    for record in records:
        table_data.append([
            record.created.strftime('%Y-%m-%d'),
            record.created.strftime('%H:%M'),
            record.person.person,
            record.dark_circles,
            record.lip_type,
            record.skin_condition
        ])

    table = Table(table_data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))

    elements.append(table)
    doc.build(elements)

    # return PDF file respone
    buffer.seek(0)
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename=HealthReport_{month_name}_{year}.pdf'
    return response

@csrf_exempt
def upload_face_photo(request):
    if request.method == 'POST':
        try:
            # Check if file was uploaded
            if 'photo' not in request.FILES:
                return JsonResponse({'status': 'error', 'message': 'No file uploaded'})
            
            photo = request.FILES['photo']
            
            # Validate file type
            if not photo.content_type.startswith('image/'):
                return JsonResponse({'status': 'error', 'message': 'Invalid file type. Please upload an image.'})
            
            # Validate file size (max 10MB)
            if photo.size > 10 * 1024 * 1024:
                return JsonResponse({'status': 'error', 'message': 'File size too large. Maximum 10MB allowed.'})
            
            # Get the original filename and extension
            original_name = photo.name
            name, ext = os.path.splitext(original_name)
            
            # Create a unique filename with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{name}_{timestamp}{ext}"
            
            # Define the faceData directory path
            face_data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'faceData')
            
            # Create faceData directory if it doesn't exist
            if not os.path.exists(face_data_dir):
                os.makedirs(face_data_dir)
            
            # Full file path
            file_path = os.path.join(face_data_dir, filename)
            
            # Save the file
            with open(file_path, 'wb+') as destination:
                for chunk in photo.chunks():
                    destination.write(chunk)
            
            return JsonResponse({
                'status': 'success', 
                'message': 'Photo uploaded successfully',
                'filename': filename,
                'path': file_path
            })
            
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'Upload failed: {str(e)}'})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})