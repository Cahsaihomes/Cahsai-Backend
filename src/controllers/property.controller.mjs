import axios from "axios";
import { MlsProperty } from "../models/mlsPropertyModel/index.mjs";
import { sequelize } from "../models/userModel/index.mjs";

export const generateMLSToken = async (req, res) => {
  try {
    const { MLS_TOKEN_URL } = process.env;
    const { MLS_CLIENT_ID, MLS_CLIENT_SECRET, MLS_SCOPE, MLS_GRANT_TYPE, USE_BASIC_AUTH } = req.body;

    console.log("Received MLS token request with body:", req.body);

    if (!MLS_CLIENT_ID || !MLS_CLIENT_SECRET || !MLS_GRANT_TYPE) {
      return res.status(400).json({
        success: false,
        message: "client_id, client_secret and grant_type are required"
      });
    }

    // Prepare form-encoded payload (required by most OAuth2 token endpoints)
    const params = new URLSearchParams();
    params.append("client_id", MLS_CLIENT_ID);
    params.append("client_secret", MLS_CLIENT_SECRET);
    if (MLS_SCOPE) params.append("scope", MLS_SCOPE);
    params.append("grant_type", MLS_GRANT_TYPE);

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded"
    };

    // Some servers expect client credentials in the Authorization header (Basic)
    // If the client uses basic auth, send Authorization header instead of client_id/secret in body
    if (USE_BASIC_AUTH || process.env.MLS_USE_BASIC_AUTH === "true") {
      const basic = Buffer.from(`${MLS_CLIENT_ID}:${MLS_CLIENT_SECRET}`).toString("base64");
      headers.Authorization = `Basic ${basic}`;
      // note: some servers still accept credentials in body, but we avoid duplication
    }

    const response = await axios.post(MLS_TOKEN_URL, params.toString(), { headers });


    const token = response.data.access_token;
    res.cookie("mlstoken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: response.data.expires_in ? response.data.expires_in * 1000 : 3600 * 1000 // default 1 hour
    });
    
    return res.status(200).json({
      success: true,
      token: response.data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Token generation failed",
      error: error.response?.data || error.message
    });
  }
};


export const getProperties = async (req, res) => {
  try {
    console.log('🔍 getProperties called with headers:', Object.keys(req.headers));
    
    // Get agentId from query parameters (GET request)
    const agentId = req.query.agentId;
    console.log('👤 AgentId from query params:', agentId || 'NOT PROVIDED');
    
    const { MLS_PROPERTIES_URL } = process.env;
    console.log('📍 MLS_PROPERTIES_URL:', MLS_PROPERTIES_URL);
    
    // Accept token from 'mlstoken' header or Authorization Bearer header
    const token = req.headers['mlstoken'] || req.headers['authorization']?.split(' ')[1];
    console.log('🔐 Token received:', token ? `${token.substring(0, 20)}...` : 'MISSING');
    
    if (!token) {
        return res.status(400).json({
            success: false, 
            message: "Token is required"
        });
    }
    
    console.log('📡 Fetching from MLS API...');
    const response = await axios.get(MLS_PROPERTIES_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const properties = response.data?.value || [];
    console.log(`📦 Received ${properties.length} properties from MLS API`);

    // Map and upsert properties into database
    const saved = [];
    const errors = [];
    
    await Promise.all(properties.map(async (p) => {
      // Attempt to locate a stable listing id from common fields
      const listingId = p.listingId || p.ListingId || p.id || p.ListingKey || p.MLSListingID || null;
      if (!listingId) {
        console.warn('⚠️  Skipping property without listingId');
        return; // skip entries without an identifier
      }

      const doc = {
        listingId,
        agentId: agentId || null,  // ✅ Save agentId from frontend
        listingKeyNumeric: Number(p.ListingKeyNumeric || p.ListingKey || p.ListingKeyNumeric) || null,
        mlsStatus: p.MlsStatus || p.mlsStatus || p.Status || null,
        propertyType: p.PropertyType || p.propertyType || null,
        propertySubType: p.PropertySubType || p.propertySubType || null,
        // Address fields (FLAT, not nested)
        streetNumber: p.StreetNumber || p.streetNumber || p.StreetNumberNumeric || null,
        streetName: p.StreetName || p.streetName || null,
        city: p.City || p.city || null,
        state: p.StateOrProvince || p.state || null,
        postalCode: p.PostalCode || p.Zip_Code || p.postalCode || null,
        county: p.County || p.county || null,
        // Pricing fields (FLAT, not nested)
        listPrice: Number(p.ListPrice || p.listPrice || p.ListingPrice) || null,
        closePrice: Number(p.ClosePrice || p.closePrice) || null,
        originalListDate: p.OriginalListDate ? new Date(p.OriginalListDate) : (p.ListingContractDate ? new Date(p.ListingContractDate) : null),
        closeDate: p.CloseDate ? new Date(p.CloseDate) : null,
        daysOnMarket: Number(p.DaysOnMarket || p.daysOnMarket) || null,
        // Details fields (FLAT, not nested)
        bedrooms: Number(p.BedroomsTotal || p.Bedrooms || p.bedrooms) || null,
        bathroomsFull: Number(p.BathroomsFull || p.bathroomsFull) || null,
        bathroomsHalf: Number(p.BathroomsHalf || p.bathroomsHalf) || null,
        roomsTotal: Number(p.RoomsTotal || p.roomsTotal) || null,
        livingAreaSqFt: Number(p.LivingArea || p.LivingArea || p.LivableArea || p.livingAreaSqFt) || null,
        lotSizeAcres: Number(p.LotSizeAcres || p.LotSize || p.lotSizeAcres) || null,
        yearBuilt: Number(p.YearBuilt || p.yearBuilt) || null,
        // Additional fields
        photosCount: Number(p.PhotosCount || p.photosCount) || null,
        lotSizeSquareFeet: Number(p.LotSizeSquareFeet || p.LotSizeSquareFeet || p.LotSizeSquareFeet) || null,
        publicRemarks: p.PublicRemarks || null,
        // Coordinates fields (FLAT, not nested)
        latitude: Number(p.Latitude || p.latitude) || null,
        longitude: Number(p.Longitude || p.longitude) || null,
        // Features & agent as JSON (these stay as objects)
        features: {
          appliances: p.Appliances || p.features?.appliances || null,
          heating: p.Heating || p.features?.heating || null,
          cooling: p.Cooling || p.features?.cooling || null,
          basement: p.Basement || p.features?.basement || null
        },
        agent: {
          firstName: p.ListAgentFirstName || p.agent?.firstName || null,
          lastName: p.ListAgentLastName || p.agent?.lastName || null,
          mlsId: p.ListAgentMlsId || p.agent?.mlsId || null,
          email: p.ListAgentEmail || p.agent?.email || null
        },
        updatedAt: new Date()
      };

      try {
        const result = await MlsProperty.upsert(doc);
        saved.push(listingId);
        console.log(`✅ Saved property: ${listingId} (${p.city})`);
      } catch (e) {
        const errorMsg = `❌ Failed to upsert property ${listingId}: ${e?.message || e}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }));

    console.log(`\n📊 SUMMARY: Fetched ${properties.length}, Saved ${saved.length}, Errors ${errors.length}`);

    return res.status(200).json({
      success: true,
      fetched: properties.length,
      saved: saved.length,
      errors: errors.length > 0 ? errors : undefined,
      properties
    });
  } catch (error) {
    console.error('❌ getProperties error:', error?.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch properties",
      error: error.response?.data || error.message
    });
  }
};

export const getSavedProperties = async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const rawLimit = req.query.limit !== undefined ? Number(req.query.limit) : undefined;
    const limit = Number.isInteger(rawLimit) ? rawLimit : 100;
    const skip = (page - 1) * (limit || 0);
    const agentId = req.query.agentId; // ✅ Get agentId from query params

    // Build query options — when limit === 0 we return all rows (no offset/limit)
    const queryOptions = {
      order: [["updatedAt", "DESC"]]
    };

    // ✅ Filter by agentId if provided
    if (agentId) {
      queryOptions.where = { agentId };
      console.log(`🔍 Filtering properties for agentId: ${agentId}`);
    } else {
      console.log('📋 Retrieving all properties (no agentId filter)');
    }

    if (limit > 0) {
      queryOptions.offset = skip;
      queryOptions.limit = limit;
    }

    console.log('DEBUG: getSavedProperties', { page, limit, skip, agentId, queryOptions });

    const { count: total, rows: properties } = await MlsProperty.findAndCountAll(queryOptions);

    // ✅ Get unique agent IDs from properties
    const uniqueAgentIds = [...new Set(properties.map(p => p.agentId).filter(Boolean))];
    
    // ✅ Fetch agent details from User model
    const User = sequelize.models.User;
    const agentsData = {};
    
    if (uniqueAgentIds.length > 0 && User) {
      const agents = await User.findAll({
        where: { id: uniqueAgentIds },
        attributes: ["id", "first_name", "last_name", "email", "contact", "avatarUrl"]
      });
      
      agents.forEach(agent => {
        agentsData[agent.id] = {
          agentId: agent.id,
          firstName: agent.first_name,
          lastName: agent.last_name,
          email: agent.email,
          contact: agent.contact,
          image: agent.avatarUrl
        };
      });
      console.log(`✅ Fetched details for ${agents.length} agents`);
    }

    // ✅ Format response with agent details
    const formattedProperties = properties.map(prop => {
      const propData = prop.toJSON();
      return {
        ...propData,
        agentDetail: prop.agentId && agentsData[prop.agentId] ? agentsData[prop.agentId] : null
      };
    });

    return res.status(200).json({
      success: true,
      total,
      page: limit === 0 ? 1 : page,
      limit: limit === 0 ? undefined : limit,
      agentId: agentId || 'all',  // ✅ Show which agent was filtered
      properties: formattedProperties  // ✅ Now includes agent details
    });
  } catch (error) {
    console.error('getSavedProperties error', error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve saved properties",
      error: error.message
    });
  }
};


