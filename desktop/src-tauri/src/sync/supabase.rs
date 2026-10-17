use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::Value;
use std::time::Duration;

#[derive(Clone)]
pub struct SupabaseClient {
    pub url: String,
    pub anon_key: String,
    client: reqwest::Client,
}

impl SupabaseClient {
    pub fn new(url: String, anon_key: String) -> Self {
        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(15))
            .build()
            .unwrap_or_default();

        Self {
            url,
            anon_key,
            client,
        }
    }

    fn headers(&self, session_token: Option<&str>) -> HeaderMap {
        let mut headers = HeaderMap::new();
        headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));
        headers.insert("apikey", HeaderValue::from_str(&self.anon_key).unwrap_or_else(|_| HeaderValue::from_static("")));

        let auth_val = if let Some(token) = session_token {
            format!("Bearer {}", token)
        } else {
            format!("Bearer {}", self.anon_key)
        };

        if let Ok(val) = HeaderValue::from_str(&auth_val) {
            headers.insert(AUTHORIZATION, val);
        }

        // Return representation for mutations
        headers.insert("Prefer", HeaderValue::from_static("return=representation,resolution=merge-duplicates"));
        headers
    }

    /// Tests if Supabase endpoint is reachable
    pub async fn check_health(&self) -> bool {
        if self.url.is_empty() || self.anon_key.is_empty() {
            return false;
        }

        let endpoint = format!("{}/rest/v1/", self.url);
        let resp = self.client
            .get(&endpoint)
            .headers(self.headers(None))
            .send()
            .await;

        match resp {
            Ok(res) => res.status().is_success() || res.status().as_u16() == 404,
            Err(_) => false,
        }
    }

    /// Push an INSERT / UPSERT mutation to Supabase table
    pub async fn upsert_record(
        &self,
        table: &str,
        data: &Value,
        session_token: Option<&str>,
    ) -> Result<Value, String> {
        let endpoint = format!("{}/rest/v1/{}", self.url, table);
        
        let res = self.client
            .post(&endpoint)
            .headers(self.headers(session_token))
            .json(data)
            .send()
            .await
            .map_err(|e| format!("Network request failed: {}", e))?;

        if !res.status().is_success() {
            let err_text = res.text().await.unwrap_or_default();
            return Err(format!("Supabase error: {}", err_text));
        }

        let result = res.json::<Value>().await.map_err(|e| format!("Invalid JSON: {}", e))?;
        Ok(result)
    }

    /// Push an UPDATE mutation
    pub async fn update_record(
        &self,
        table: &str,
        id_column: &str,
        id_value: &str,
        data: &Value,
        session_token: Option<&str>,
    ) -> Result<Value, String> {
        let endpoint = format!("{}/rest/v1/{}?{}=eq.{}", self.url, table, id_column, id_value);

        let res = self.client
            .patch(&endpoint)
            .headers(self.headers(session_token))
            .json(data)
            .send()
            .await
            .map_err(|e| format!("Network error: {}", e))?;

        if !res.status().is_success() {
            let err_text = res.text().await.unwrap_or_default();
            return Err(format!("Supabase error: {}", err_text));
        }

        let result = res.json::<Value>().await.map_err(|e| format!("Invalid JSON: {}", e))?;
        Ok(result)
    }

    /// Push a DELETE mutation
    pub async fn delete_record(
        &self,
        table: &str,
        id_column: &str,
        id_value: &str,
        session_token: Option<&str>,
    ) -> Result<(), String> {
        let endpoint = format!("{}/rest/v1/{}?{}=eq.{}", self.url, table, id_column, id_value);

        let res = self.client
            .delete(&endpoint)
            .headers(self.headers(session_token))
            .send()
            .await
            .map_err(|e| format!("Network error: {}", e))?;

        if !res.status().is_success() {
            let err_text = res.text().await.unwrap_or_default();
            return Err(format!("Supabase error: {}", err_text));
        }

        Ok(())
    }

    /// Pull records from Supabase table modified after `since_timestamp`
    pub async fn fetch_table_data(
        &self,
        table: &str,
        org_id: Option<&str>,
        session_token: Option<&str>,
    ) -> Result<Vec<Value>, String> {
        let mut endpoint = format!("{}/rest/v1/{}?select=*", self.url, table);
        if let Some(org) = org_id {
            endpoint.push_str(&format!("&organization_id=eq.{}", org));
        }

        let res = self.client
            .get(&endpoint)
            .headers(self.headers(session_token))
            .send()
            .await
            .map_err(|e| format!("Network error: {}", e))?;

        if !res.status().is_success() {
            let err_text = res.text().await.unwrap_or_default();
            return Err(format!("Fetch table {} failed: {}", table, err_text));
        }

        let items = res.json::<Vec<Value>>().await.map_err(|e| format!("Invalid JSON array: {}", e))?;
        Ok(items)
    }
}
