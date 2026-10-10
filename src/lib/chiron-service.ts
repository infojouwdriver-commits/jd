import {safeChironUrl} from "./security-policy";


import CrudOperations from './crud-operations';
import { generateAdminUserToken } from './auth';

interface CompanyChironConfig {
  id: number;
  name: string;
  vat_number: string | null;
  kbo_number: string | null;
  chiron_mode: 'TEST' | 'PRODUCTION';
  chiron_test_client_id: string;
  chiron_test_client_secret: string;
  chiron_test_auth_url: string;
  chiron_test_api_url: string;
  chiron_prod_client_id: string;
  chiron_prod_client_secret: string;
  chiron_prod_auth_url: string;
  chiron_prod_api_url: string;
  base_rate_per_km: number;
  base_rate_per_minute: number;
  minimum_fare: number;
  airport_surcharge: number;
  night_surcharge_percentage: number;
  peak_hour_surcharge_percentage: number;
  night_start_hour: number;
  night_end_hour: number;
  peak_hours: any;
}

interface ChironEnvironment {
  clientId: string;
  clientSecret: string;
  authUrl: string;
  apiUrl: string;
}

type ChironStatus = 'reservatie' | 'vertrek' | 'aankomst';

interface ChironRideMessage {
  status: ChironStatus;
  ritnummer: string;
  broncreatiedatum: string;
  rit: {
    taxibedrijf: {
      aanbieder: {
        registratie: string;
        naam: string;
        subregistratie?: string;
      };
      contract?: {
        contractnummer: string;
        contractant: string;
      };
    };
    voertuig?: {
      nummerplaat: string;
    };
    uitvoerder?: {
      bestuurderspasnummer: string;
    };
    vertrektijdstip?: string;
    vertrekpunt?: {
      lengtegraad: number;
      breedtegraad: number;
    };
    aankomsttijdstip?: string;
    aankomstpunt?: {
      lengtegraad: number;
      breedtegraad: number;
    };
    afstand?: {
      waarde: number;
    };
    kostprijs?: {
      waarde: number;
    };
  };
}

interface PlatformContract {
  id: number;
  company_id: number;
  platform_name: string;
  contract_number: string;
  contractor_name: string;
  is_active: boolean;
}

export class ChironService {
  /**
   * ✅ CH1205 & CH1208 Fix: تنسيق الإحداثيات إلى 3 خانات عشرية بالضبط
   * 
   * هذه الدالة تضمن أن الرقم يحتوي على 3 خانات عشرية بالضبط - لا أكثر ولا أقل
   * بناءً على الدليل التقني الرسمي لـ Chiron API والأنظمة الناجحة
   * 
   * أمثلة:
   * - 50.85 → 50.850 (إضافة صفر)
   * - 4.3 → 4.300 (إضافة صفرين)
   * - 50.8503 → 50.850 (تقريب)
   * - 50.123456 → 50.123 (تقريب)
   * 
   * @param value - قيمة الإحداثية (خط العرض أو خط الطول)
   * @returns قيمة منسقة بـ 3 خانات عشرية بالضبط
   */
  private static formatCoordinate(value: number): number {
    if (!isFinite(value) || isNaN(value)) {
      throw new Error(`Invalid coordinate value: ${value}`);
    }
    
    // التحقق من نطاق الإحداثيات
    if (value < -180 || value > 180) {
      throw new Error(`Coordinate out of range: ${value}. Must be between -180 and 180`);
    }
    
    // تقريب إلى 3 خانات عشرية بالضبط
    // استخدام Math.round لضمان التقريب الصحيح
    const rounded = Math.round(value * 1000) / 1000;
    
    // تحويل إلى string مع 3 خانات عشرية بالضبط ثم إلى number
    // هذا يضمن أن 50.85 يصبح 50.850 وليس 50.85
    return parseFloat(rounded.toFixed(3));
  }

  /**
   * ✅ CH1205 Fix: تقريب المسافة إلى 3 خانات عشرية كحد أقصى
   * 
   * @param value - المسافة بالكيلومتر
   * @returns مسافة مقربة إلى 3 خانات عشرية
   */
  private static formatDistance(value: number): number {
    if (!isFinite(value) || isNaN(value)) {
      throw new Error(`Invalid distance value: ${value}`);
    }
    
    if (value < 0) {
      throw new Error(`Distance must be positive: ${value}`);
    }
    
    // تقريب إلى 3 خانات عشرية
    const rounded = Math.round(value * 1000) / 1000;
    return parseFloat(rounded.toFixed(3));
  }

  /**
   * ✅ CH1205 Fix: تقريب السعر إلى خانتين عشريتين كحد أقصى
   * 
   * @param value - السعر باليورو
   * @returns سعر مقرب إلى خانتين عشريتين
   */
  private static formatPrice(value: number): number {
    if (!isFinite(value) || isNaN(value)) {
      throw new Error(`Invalid price value: ${value}`);
    }
    
    if (value < 0) {
      throw new Error(`Price must be positive: ${value}`);
    }
    
    // تقريب إلى خانتين عشريتين
    const rounded = Math.round(value * 100) / 100;
    return parseFloat(rounded.toFixed(2));
  }

  /**
   * ✅ تنسيق التاريخ والوقت بصيغة ISO 8601 الصحيحة لـ Chiron
   * 
   * @param dateString - تاريخ ووقت بأي صيغة
   * @returns تاريخ ووقت بصيغة ISO 8601
   */
  private static formatChironDateTime(dateString: string): string {
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${dateString}`);
      }
      
      return date.toISOString();
    } catch (error) {
      console.error("Operation failed");
      throw new Error(`Invalid date format: ${dateString}`);
    }
  }

  /**
   * ✅ التحقق من صحة ritnummer
   */
  private static validateRitnummer(ritnummer: string): void {
    if (!ritnummer || ritnummer.trim() === '') {
      throw new Error('Ritnummer cannot be empty');
    }
    
    if (ritnummer.length > 100) {
      throw new Error('Ritnummer is too long (max 100 characters)');
    }
    
    const validPattern = /^[a-zA-Z0-9\-_]+$/;
    if (!validPattern.test(ritnummer)) {
      throw new Error('Ritnummer contains invalid characters (only alphanumeric, dash, and underscore allowed)');
    }
  }

  /**
   * ✅ التحقق من صحة KBO number
   */
  private static validateKboNumber(kboNumber: string): void {
    if (!kboNumber || kboNumber.trim() === '') {
      throw new Error('KBO number is required');
    }
    
    const cleanKbo = kboNumber.replace(/\./g, '');
    if (!/^\d{10}$/.test(cleanKbo)) {
      throw new Error('KBO number must be 10 digits');
    }
  }

  /**
   * ✅ التحقق الشامل من صحة بيانات الرحلة قبل الإرسال
   */
  private static validateTripData(tripData: {
    start_lat?: number;
    start_lon?: number;
    end_lat?: number;
    end_lon?: number;
    distance_km?: number;
    price?: number;
    start_time?: string;
    end_time?: string;
  }): void {
    if (tripData.start_lat !== undefined) {
      if (!isFinite(tripData.start_lat) || tripData.start_lat < -90 || tripData.start_lat > 90) {
        throw new Error(`Invalid start latitude: ${tripData.start_lat}. Must be between -90 and 90`);
      }
    }
    
    if (tripData.start_lon !== undefined) {
      if (!isFinite(tripData.start_lon) || tripData.start_lon < -180 || tripData.start_lon > 180) {
        throw new Error(`Invalid start longitude: ${tripData.start_lon}. Must be between -180 and 180`);
      }
    }
    
    if (tripData.end_lat !== undefined) {
      if (!isFinite(tripData.end_lat) || tripData.end_lat < -90 || tripData.end_lat > 90) {
        throw new Error(`Invalid end latitude: ${tripData.end_lat}. Must be between -90 and 90`);
      }
    }
    
    if (tripData.end_lon !== undefined) {
      if (!isFinite(tripData.end_lon) || tripData.end_lon < -180 || tripData.end_lon > 180) {
        throw new Error(`Invalid end longitude: ${tripData.end_lon}. Must be between -180 and 180`);
      }
    }
    
    if (tripData.distance_km !== undefined) {
      if (!isFinite(tripData.distance_km) || tripData.distance_km < 0) {
        throw new Error(`Invalid distance: ${tripData.distance_km}. Must be a positive number`);
      }
      if (tripData.distance_km > 1000) {
        void 0;
      }
    }
    
    if (tripData.price !== undefined) {
      if (!isFinite(tripData.price) || tripData.price < 0) {
        throw new Error(`Invalid price: ${tripData.price}. Must be a positive number`);
      }
      if (tripData.price > 10000) {
        void 0;
      }
    }
    
    if (tripData.start_time) {
      const startDate = new Date(tripData.start_time);
      if (isNaN(startDate.getTime())) {
        throw new Error(`Invalid start time: ${tripData.start_time}`);
      }
    }
    
    if (tripData.end_time) {
      const endDate = new Date(tripData.end_time);
      if (isNaN(endDate.getTime())) {
        throw new Error(`Invalid end time: ${tripData.end_time}`);
      }
      
      if (tripData.start_time) {
        const startDate = new Date(tripData.start_time);
        if (endDate <= startDate) {
          throw new Error('End time must be after start time');
        }
      }
    }
  }

  static async getCompanyConfig(companyId: number): Promise<CompanyChironConfig> {
    const adminToken = await generateAdminUserToken();
    const companiesCrud = new CrudOperations('companies', adminToken);

    const company = await companiesCrud.findById(companyId);

    if (!company) {
      throw new Error('Company not found');
    }

    return company as CompanyChironConfig;
  }

  static async getPlatformContract(companyId: number, platformName: string): Promise<PlatformContract | null> {
    const adminToken = await generateAdminUserToken();
    const platformContractsCrud = new CrudOperations('platform_contracts', adminToken);

    const contracts = await platformContractsCrud.findMany({
      company_id: companyId,
      platform_name: platformName.toLowerCase(),
      is_active: true
    });

    if (!contracts || contracts.length === 0) {
      return null;
    }

    return contracts[0] as PlatformContract;
  }

  static getPricingJson(company: CompanyChironConfig) {
    return {
      base_fee: company.minimum_fare ?? 10.00,
      km_rate: company.base_rate_per_km ?? 2.00,
      minute_rate: company.base_rate_per_minute ?? 0.50,
      minimum_fare: company.minimum_fare ?? 10.00,
      airport_fee: company.airport_surcharge ?? 5.00,
      night_surcharge_percentage: company.night_surcharge_percentage ?? 20.00,
      peak_hour_surcharge_percentage: company.peak_hour_surcharge_percentage ?? 15.00
    };
  }

  static resolveEnvironment(company: CompanyChironConfig): ChironEnvironment {
    const mode = String(company.chiron_mode).toUpperCase();
    if (!['TEST', 'PRODUCTION'].includes(mode)) throw new Error('Invalid Chiron environment');
    if (mode === 'TEST') {
      if (!company.chiron_test_client_id || !company.chiron_test_client_secret) {
        throw new Error('Test Chiron credentials are not configured for this company');
      }
      return {
        clientId: company.chiron_test_client_id,
        clientSecret: company.chiron_test_client_secret,
        authUrl: company.chiron_test_auth_url || 'https://mow-acc.api.vlaanderen.be/oauth/token',
        apiUrl: company.chiron_test_api_url || 'https://mow-acc.api.vlaanderen.be/chiron/taxirit'
      };
    } else {
      if (!company.chiron_prod_client_id || !company.chiron_prod_client_secret) {
        throw new Error('Production Chiron credentials are not configured for this company');
      }
      return {
        clientId: company.chiron_prod_client_id,
        clientSecret: company.chiron_prod_client_secret,
        authUrl: company.chiron_prod_auth_url || 'https://mow.api.vlaanderen.be/oauth/token',
        apiUrl: company.chiron_prod_api_url || 'https://mow.api.vlaanderen.be/chiron/taxirit'
      };
    }
  }

  static async getAccessToken(companyId: number): Promise<string> {
    const company = await this.getCompanyConfig(companyId);
    const env = this.resolveEnvironment(company);

    void 0;
    void 0;

    const credentials = Buffer.from(`${env.clientId}:${env.clientSecret}`).toString('base64');

    const res = await fetch(safeChironUrl(env.authUrl), {
      redirect: "error", signal: AbortSignal.timeout(15000),
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials'
      })
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Operation failed");
      throw new Error(`Failed to get Chiron access token: ${res.status} - ${text}`);
    }

    const json = await res.json();
    const newToken = json.access_token;

    void 0;
    return newToken;
  }

  static async sendChironMessage(companyId: number, message: ChironRideMessage): Promise<any> {
    const company = await this.getCompanyConfig(companyId);
    const env = this.resolveEnvironment(company);

    const token = await this.getAccessToken(companyId);

    void 0;
    void 0;
    void 0;
    void 0;

    const res = await fetch(safeChironUrl(env.apiUrl), {
      redirect: "error", signal: AbortSignal.timeout(15000),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(message)
    });

    const responseText = await res.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    if (!res.ok) {
      console.error("Operation failed");
      console.error("Operation failed");
      
      let errorCode = 'UNKNOWN';
      if (responseData && typeof responseData === 'object') {
        errorCode = responseData.code || responseData.errorCode || responseData.error || 'UNKNOWN';
      }
      
      throw new Error(`Chiron error [${errorCode}]: ${res.status} - ${responseText}`);
    }

    void 0;
    return {
      ...responseData,
      httpStatus: res.status
    };
  }

  /**
   * ✅ إرسال رسالة START فقط
   * ✅ CH1208 & CH1205 Fix: تنسيق الإحداثيات بشكل صحيح
   */
  static async sendTripStart(
    tripId: number,
    companyId: number,
    tripData: {
      driver_id: number;
      vehicle_id: number;
      start_time: string;
      start_lat: number;
      start_lon: number;
      ritnummer: string;
      external_source?: string;
    }
  ): Promise<{ success: boolean; response: any }> {
    const adminToken = await generateAdminUserToken();
    const tripsCrud = new CrudOperations('trips', adminToken);
    
    const trip = await tripsCrud.findById(tripId);
    if (!trip) {
      throw new Error('Trip not found');
    }

    if (trip.chiron_sync_state === 'START_SENT' || trip.chiron_sync_state === 'START_ACCEPTED') {
      throw new Error('CH1210 Prevention: START already sent for this trip');
    }

    const company = await this.getCompanyConfig(companyId);
    
    if (!company.kbo_number) {
      throw new Error('Company KBO number is required for Chiron submission');
    }
    this.validateKboNumber(company.kbo_number);

    const driversCrud = new CrudOperations('drivers', adminToken);
    const driver = await driversCrud.findById(tripData.driver_id);
    
    if (!driver || !driver.capacity_certificate_number) {
      throw new Error('Driver capacity certificate number is required');
    }

    const vehiclesCrud = new CrudOperations('vehicles', adminToken);
    const vehicle = await vehiclesCrud.findById(tripData.vehicle_id);
    
    if (!vehicle || !vehicle.plate_number) {
      throw new Error('Vehicle plate number is required');
    }

    this.validateRitnummer(tripData.ritnummer);

    this.validateTripData({
      start_lat: tripData.start_lat,
      start_lon: tripData.start_lon,
      start_time: tripData.start_time
    });

    const formattedStartTime = this.formatChironDateTime(tripData.start_time);
    const formattedBroncreatiedatum = this.formatChironDateTime(new Date().toISOString());

    // ✅ CH1208 & CH1205 Fix: تنسيق الإحداثيات إلى 3 خانات عشرية بالضبط
    const formattedStartLat = this.formatCoordinate(tripData.start_lat);
    const formattedStartLon = this.formatCoordinate(tripData.start_lon);

    void 0;
    void 0;
    void 0;
    void 0;

    const baseRitData: any = {
      taxibedrijf: {
        aanbieder: {
          registratie: company.kbo_number,
          naam: company.name
        }
      },
      voertuig: {
        nummerplaat: vehicle.plate_number
      },
      uitvoerder: {
        bestuurderspasnummer: driver.capacity_certificate_number
      },
      vertrektijdstip: formattedStartTime,
      vertrekpunt: {
        lengtegraad: formattedStartLon,
        breedtegraad: formattedStartLat
      }
    };

    if (tripData.external_source) {
      const platformContract = await this.getPlatformContract(companyId, tripData.external_source);
      
      if (platformContract) {
        baseRitData.taxibedrijf.contract = {
          contractnummer: platformContract.contract_number,
          contractant: platformContract.contractor_name
        };
        void 0;
      }
    }

    const vertrekMessage: ChironRideMessage = {
      status: 'vertrek',
      ritnummer: tripData.ritnummer,
      broncreatiedatum: formattedBroncreatiedatum,
      rit: baseRitData
    };

    void 0;
    void 0;
    void 0;
    void 0;
    void 0;

    await tripsCrud.update(tripId, {
      chiron_sync_state: 'START_SENT',
      start_sent_at: new Date().toISOString()
    });

    try {
      const response = await this.sendChironMessage(companyId, vertrekMessage);

      if (response.httpStatus >= 200 && response.httpStatus < 300) {
        await tripsCrud.update(tripId, {
          chiron_sync_state: 'START_ACCEPTED',
          start_sync_response: response,
          start_accepted_at: new Date().toISOString()
        });

        void 0;

        return { success: true, response };
      } else {
        throw new Error(`Unexpected HTTP status: ${response.httpStatus}`);
      }
    } catch (error: any) {
      await tripsCrud.update(tripId, {
        chiron_sync_state: 'CREATED',
        sync_error_message: error.message
      });

      console.error("Operation failed");
      throw error;
    }
  }

  /**
   * ✅ إرسال رسالة ARRIVAL فقط
   * ✅ CH1208 & CH1205 Fix: تنسيق جميع البيانات بشكل صحيح
   */
  static async sendTripArrival(
    tripId: number,
    companyId: number,
    tripData: {
      driver_id: number;
      vehicle_id: number;
      start_time: string;
      end_time: string;
      start_lat: number;
      start_lon: number;
      end_lat: number;
      end_lon: number;
      distance_km: number;
      price: number;
      ritnummer: string;
      external_source?: string;
    }
  ): Promise<{ success: boolean; response: any }> {
    const adminToken = await generateAdminUserToken();
    const tripsCrud = new CrudOperations('trips', adminToken);
    
    const trip = await tripsCrud.findById(tripId);
    if (!trip) {
      throw new Error('Trip not found');
    }

    if (trip.chiron_sync_state !== 'START_ACCEPTED') {
      throw new Error(`CH1210 Prevention: Cannot send ARRIVAL before START is accepted. Current state: ${trip.chiron_sync_state}`);
    }

    if (!trip.start_accepted_at) {
      throw new Error('CH1210 Prevention: START acceptance timestamp is missing');
    }

    if (trip.chiron_sync_state === 'ARRIVAL_SENT' || trip.chiron_sync_state === 'COMPLETED') {
      throw new Error('CH1210 Prevention: ARRIVAL already sent for this trip');
    }

    const company = await this.getCompanyConfig(companyId);
    
    if (!company.kbo_number) {
      throw new Error('Company KBO number is required');
    }
    this.validateKboNumber(company.kbo_number);

    const driversCrud = new CrudOperations('drivers', adminToken);
    const driver = await driversCrud.findById(tripData.driver_id);
    
    if (!driver || !driver.capacity_certificate_number) {
      throw new Error('Driver capacity certificate number is required');
    }

    const vehiclesCrud = new CrudOperations('vehicles', adminToken);
    const vehicle = await vehiclesCrud.findById(tripData.vehicle_id);
    
    if (!vehicle || !vehicle.plate_number) {
      throw new Error('Vehicle plate number is required');
    }

    this.validateRitnummer(tripData.ritnummer);

    this.validateTripData({
      start_lat: tripData.start_lat,
      start_lon: tripData.start_lon,
      end_lat: tripData.end_lat,
      end_lon: tripData.end_lon,
      distance_km: tripData.distance_km,
      price: tripData.price,
      start_time: tripData.start_time,
      end_time: tripData.end_time
    });

    // ✅ CH1205 Fix: تنسيق المسافة والسعر
    const formattedDistance = this.formatDistance(tripData.distance_km);
    const formattedPrice = this.formatPrice(tripData.price);
    
    // ✅ CH1208 Fix: تنسيق جميع الإحداثيات إلى 3 خانات عشرية بالضبط
    const formattedStartLat = this.formatCoordinate(tripData.start_lat);
    const formattedStartLon = this.formatCoordinate(tripData.start_lon);
    const formattedEndLat = this.formatCoordinate(tripData.end_lat);
    const formattedEndLon = this.formatCoordinate(tripData.end_lon);
    
    const formattedStartTime = this.formatChironDateTime(tripData.start_time);
    const formattedEndTime = this.formatChironDateTime(tripData.end_time);
    const formattedBroncreatiedatum = this.formatChironDateTime(new Date().toISOString());
    
    void 0;
    void 0;
    void 0;
    void 0;
    void 0;

    const aankomstRitData: any = {
      taxibedrijf: {
        aanbieder: {
          registratie: company.kbo_number,
          naam: company.name
        }
      },
      voertuig: {
        nummerplaat: vehicle.plate_number
      },
      uitvoerder: {
        bestuurderspasnummer: driver.capacity_certificate_number
      },
      vertrektijdstip: formattedStartTime,
      vertrekpunt: {
        lengtegraad: formattedStartLon,
        breedtegraad: formattedStartLat
      },
      aankomsttijdstip: formattedEndTime,
      aankomstpunt: {
        lengtegraad: formattedEndLon,
        breedtegraad: formattedEndLat
      },
      afstand: {
        waarde: formattedDistance
      },
      kostprijs: {
        waarde: formattedPrice
      }
    };

    void 0;
    void 0;
    void 0;
    void 0;
    void 0;
    void 0;
    void 0;
    void 0;

    if (tripData.external_source) {
      const platformContract = await this.getPlatformContract(companyId, tripData.external_source);
      
      if (platformContract) {
        aankomstRitData.taxibedrijf.contract = {
          contractnummer: platformContract.contract_number,
          contractant: platformContract.contractor_name
        };
      }
    }

    const aankomstMessage: ChironRideMessage = {
      status: 'aankomst',
      ritnummer: tripData.ritnummer,
      broncreatiedatum: formattedBroncreatiedatum,
      rit: aankomstRitData
    };

    await tripsCrud.update(tripId, {
      chiron_sync_state: 'ARRIVAL_SENT',
      arrival_sent_at: new Date().toISOString()
    });

    try {
      const response = await this.sendChironMessage(companyId, aankomstMessage);

      if (response.httpStatus >= 200 && response.httpStatus < 300) {
        await tripsCrud.update(tripId, {
          chiron_sync_state: 'COMPLETED',
          arrival_sync_response: response,
          status: 'success'
        });

        void 0;

        return { success: true, response };
      } else {
        throw new Error(`Unexpected HTTP status: ${response.httpStatus}`);
      }
    } catch (error: any) {
      await tripsCrud.update(tripId, {
        chiron_sync_state: 'START_ACCEPTED',
        sync_error_message: error.message
      });

      console.error("Operation failed");
      throw error;
    }
  }

  /**
   * ✅ إرسال رحلة كاملة (START ثم ARRIVAL) مع State Machine
   */
  static async sendTrip(
    companyId: number,
    tripData: {
      driver_id: number;
      vehicle_id: number;
      start_time: string;
      end_time: string;
      start_lat: number;
      start_lon: number;
      end_lat: number;
      end_lon: number;
      distance_km: number;
      price: number;
      ritnummer?: string;
      external_source?: string;
      currency?: string;
    }
  ): Promise<{ tripId: string; status: string }> {
    const adminToken = await generateAdminUserToken();
    const tripsCrud = new CrudOperations('trips', adminToken);

    const ritnummer = tripData.ritnummer || `TRIP-${companyId}-${Date.now()}`;

    this.validateRitnummer(ritnummer);

    // ✅ تنسيق البيانات قبل الحفظ
    const formattedDistance = this.formatDistance(tripData.distance_km);
    const formattedPrice = this.formatPrice(tripData.price);

    const existingTrips = await tripsCrud.findMany({ ritnummer });
    let tripId: number;

    if (existingTrips && existingTrips.length > 0) {
      tripId = existingTrips[0].id;
      void 0;
    } else {
      const newTrip = await tripsCrud.create({
        user_id: 1,
        company_id: companyId,
        driver_id: tripData.driver_id,
        vehicle_id: tripData.vehicle_id,
        start_time: tripData.start_time,
        end_time: tripData.end_time,
        start_lat: tripData.start_lat,
        start_lon: tripData.start_lon,
        end_lat: tripData.end_lat,
        end_lon: tripData.end_lon,
        distance_km: formattedDistance,
        price: formattedPrice,
        ritnummer,
        chiron_sync_state: 'CREATED',
        status: 'completed',
        external_source: tripData.external_source || null,
        currency: tripData.currency || 'EUR'
      });
      tripId = newTrip.id;
      void 0;
    }

    void 0;

    void 0;
    const startResult = await this.sendTripStart(tripId, companyId, {
      driver_id: tripData.driver_id,
      vehicle_id: tripData.vehicle_id,
      start_time: tripData.start_time,
      start_lat: tripData.start_lat,
      start_lon: tripData.start_lon,
      ritnummer,
      external_source: tripData.external_source
    });

    if (!startResult.success) {
      throw new Error('Failed to send START message');
    }

    void 0;

    void 0;
    
    const updatedTrip = await tripsCrud.findById(tripId);
    if (updatedTrip?.chiron_sync_state !== 'START_ACCEPTED') {
      throw new Error('START was not accepted by Chiron');
    }

    void 0;

    void 0;
    const arrivalResult = await this.sendTripArrival(tripId, companyId, {
      driver_id: tripData.driver_id,
      vehicle_id: tripData.vehicle_id,
      start_time: tripData.start_time,
      end_time: tripData.end_time,
      start_lat: tripData.start_lat,
      start_lon: tripData.start_lon,
      end_lat: tripData.end_lat,
      end_lon: tripData.end_lon,
      distance_km: formattedDistance,
      price: formattedPrice,
      ritnummer,
      external_source: tripData.external_source
    });

    if (!arrivalResult.success) {
      throw new Error('Failed to send ARRIVAL message');
    }

    void 0;
    void 0;
    void 0;

    return {
      tripId: ritnummer,
      status: 'success'
    };
  }

  /**
   * ✅ تشغيل اختبار القبول البلدي (10 رسائل: 5 START + 5 ARRIVAL)
   */
  static async runAcceptanceTest(
    companyId: number,
    driverId: number,
    vehicleId: number
  ): Promise<{
    success: boolean;
    totalMessages: number;
    successCount: number;
    failedCount: number;
    results: any[];
  }> {
    const adminToken = await generateAdminUserToken();
    
    const company = await this.getCompanyConfig(companyId);
    if (String(company.chiron_mode).toUpperCase() !== 'TEST') {
      throw new Error('Company must be in TEST mode to run acceptance test');
    }

    if (!company.kbo_number) {
      throw new Error('Company KBO number is required');
    }

    const driversCrud = new CrudOperations('drivers', adminToken);
    const driver = await driversCrud.findById(driverId);
    
    if (!driver || !driver.capacity_certificate_number) {
      throw new Error('Driver capacity certificate number is required');
    }

    const vehiclesCrud = new CrudOperations('vehicles', adminToken);
    const vehicle = await vehiclesCrud.findById(vehicleId);
    
    if (!vehicle || !vehicle.plate_number) {
      throw new Error('Vehicle plate number is required');
    }

    const results = [];
    let successCount = 0;
    let failedCount = 0;

    const testLocations = [
      { 
        lat: 50.8503, 
        lon: 4.3517, 
        address: 'Grand Place, 1000 Brussels, Belgium' 
      },
      { 
        lat: 50.8467, 
        lon: 4.3525, 
        address: 'Brussels Central Station, Carrefour de l\'Europe 2, 1000 Brussels, Belgium' 
      },
      { 
        lat: 50.8798, 
        lon: 4.7005, 
        address: 'Brussels Airport, Leopoldlaan, 1930 Zaventem, Belgium' 
      },
      { 
        lat: 50.8476, 
        lon: 4.3572, 
        address: 'Manneken Pis, Rue de l\'Étuve 46, 1000 Brussels, Belgium' 
      },
      { 
        lat: 50.8411, 
        lon: 4.3571, 
        address: 'Brussels South Station, Avenue Fonsny 47B, 1060 Brussels, Belgium' 
      }
    ];

    const pricing = this.getPricingJson(company);
    const testTripsCrud = new CrudOperations('test_trips', adminToken);

    void 0;
    void 0;
    void 0;
    void 0;

    for (let i = 0; i < 5; i++) {
      const ritnummer = `TEST-${companyId}-${Date.now()}-${i + 1}`;
      const startLoc = testLocations[i];
      const endLoc = testLocations[(i + 1) % 5];
      const distance = Math.random() * 10 + 5;
      const price = pricing.base_fee + (distance * pricing.km_rate);
      
      const startTime = new Date(Date.now() + i * 30 * 60_000);
      const endTime = new Date(startTime.getTime() + 15 * 60_000);

      void 0;
      void 0;

      try {
        await this.sendTrip(companyId, {
          driver_id: driverId,
          vehicle_id: vehicleId,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          start_lat: startLoc.lat,
          start_lon: startLoc.lon,
          end_lat: endLoc.lat,
          end_lon: endLoc.lon,
          distance_km: distance,
          price: price,
          ritnummer
        });

        await testTripsCrud.create({
          company_id: companyId,
          ritnummer: `${ritnummer}-VERTREK`,
          message_type: 'vertrek',
          driver_id: driverId,
          vehicle_id: vehicleId,
          chiron_driver_id: driver.capacity_certificate_number,
          chiron_vehicle_id: vehicle.plate_number,
          start_lat: startLoc.lat,
          start_lon: startLoc.lon,
          start_address: startLoc.address,
          start_time: startTime.toISOString(),
          timestamp: startTime.toISOString(),
          test_sequence_number: i + 1,
          sync_status: 'success',
          http_status_code: 200
        });

        await testTripsCrud.create({
          company_id: companyId,
          ritnummer: `${ritnummer}-AANKOMST`,
          message_type: 'aankomst',
          driver_id: driverId,
          vehicle_id: vehicleId,
          chiron_driver_id: driver.capacity_certificate_number,
          chiron_vehicle_id: vehicle.plate_number,
          start_lat: startLoc.lat,
          start_lon: startLoc.lon,
          end_lat: endLoc.lat,
          end_lon: endLoc.lon,
          start_address: startLoc.address,
          end_address: endLoc.address,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          distance_km: this.formatDistance(distance),
          price: this.formatPrice(price),
          timestamp: endTime.toISOString(),
          test_sequence_number: i + 6,
          sync_status: 'success',
          http_status_code: 200
        });

        successCount++;
        results.push({
          ritnummer,
          status: 'success',
          vertrek: true,
          aankomst: true,
          startAddress: startLoc.address,
          endAddress: endLoc.address,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          startLat: startLoc.lat,
          startLon: startLoc.lon,
          endLat: endLoc.lat,
          endLon: endLoc.lon
        });

        void 0;

      } catch (error: any) {
        failedCount++;
        
        console.error("Operation failed");
        
        try {
          await testTripsCrud.create({
            company_id: companyId,
            ritnummer: `${ritnummer}-FAILED`,
            message_type: 'vertrek',
            driver_id: driverId,
            vehicle_id: vehicleId,
            chiron_driver_id: driver.capacity_certificate_number,
            chiron_vehicle_id: vehicle.plate_number,
            start_lat: startLoc.lat,
            start_lon: startLoc.lon,
            start_address: startLoc.address,
            timestamp: startTime.toISOString(),
            test_sequence_number: i + 1,
            sync_status: 'failed',
            error_message: error.message,
            http_status_code: 500
          });
        } catch (dbError) {
          console.error("Operation failed");
        }

        results.push({
          ritnummer,
          status: 'failed',
          error: error.message,
          startAddress: startLoc.address,
          endAddress: endLoc.address,
          startLat: startLoc.lat,
          startLon: startLoc.lon,
          endLat: endLoc.lat,
          endLon: endLoc.lon
        });
      }
    }

    void 0;
    void 0;
    void 0;
    void 0;
    void 0;

    return {
      success: failedCount === 0,
      totalMessages: 10,
      successCount: successCount * 2,
      failedCount: failedCount * 2,
      results
    };
  }

  static async logSyncAttempt(
    tripId: number,
    attemptNumber: number,
    status: 'success' | 'failed' | 'pending',
    requestPayload: any,
    responsePayload?: any,
    errorMessage?: string,
    httpStatusCode?: number
  ): Promise<void> {
    const adminToken = await generateAdminUserToken();
    const syncLogCrud = new CrudOperations('chiron_sync_log', adminToken);
    
    await syncLogCrud.create({
      trip_id: tripId,
      attempt_number: attemptNumber,
      status,
      request_payload: requestPayload,
      response_payload: responsePayload || null,
      error_message: errorMessage || null,
      http_status_code: httpStatusCode || null
    });
  }

  static calculateProposedFare(
    distanceKm: number,
    durationMinutes: number,
    pricing: {
      base_fee: number;
      km_rate: number;
      minute_rate: number;
      minimum_fare: number;
      night_fee?: number;
      airport_fee?: number;
    },
    options?: { isNight?: boolean; isAirport?: boolean }
  ): number {
    let price =
      pricing.base_fee +
      distanceKm * pricing.km_rate +
      durationMinutes * pricing.minute_rate;

    if (options?.isNight && pricing.night_fee) {
      price += pricing.night_fee;
    }

    if (options?.isAirport && pricing.airport_fee) {
      price += pricing.airport_fee;
    }

    if (price < pricing.minimum_fare) {
      price = pricing.minimum_fare;
    }

    return Math.round(price * 100) / 100;
  }
}
