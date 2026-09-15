package com.song.kapeko.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class Product {

    private String id;
    private String name;
    private String category;
    private String roast;
    private String origin;
    private String farmer;
    private String altitude;
    private String variety;
    private String process;

    @JsonProperty("price_php")
    private int pricePHP;

    @JsonProperty("sub_price_php")
    private int subPricePHP;

    @JsonProperty("flavor_notes")
    private List<String> flavorNotes;

    @JsonProperty("best_for")
    private String bestFor;

    @JsonProperty("in_stock")
    private boolean inStock;

    @JsonProperty("subscription_available")
    private boolean subscriptionAvailable;

    // AI-generated content fields (populated by Lab 4)
    @JsonProperty("seo_title")
    private String seoTitle;

    @JsonProperty("meta_description")
    private String metaDescription;

    @JsonProperty("product_description")
    private String productDescription;

    @JsonProperty("marketing_hook")
    private String marketingHook;

    @JsonProperty("feature_bullets")
    private List<String> featureBullets;

    @JsonProperty("pairing_suggestion")
    private String pairingSuggestion;

    // ── Getters & Setters ──────────────────────────────────────────────

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getRoast() { return roast; }
    public void setRoast(String roast) { this.roast = roast; }

    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }

    public String getFarmer() { return farmer; }
    public void setFarmer(String farmer) { this.farmer = farmer; }

    public String getAltitude() { return altitude; }
    public void setAltitude(String altitude) { this.altitude = altitude; }

    public String getVariety() { return variety; }
    public void setVariety(String variety) { this.variety = variety; }

    public String getProcess() { return process; }
    public void setProcess(String process) { this.process = process; }

    public int getPricePHP() { return pricePHP; }
    public void setPricePHP(int pricePHP) { this.pricePHP = pricePHP; }

    public int getSubPricePHP() { return subPricePHP; }
    public void setSubPricePHP(int subPricePHP) { this.subPricePHP = subPricePHP; }

    public List<String> getFlavorNotes() { return flavorNotes; }
    public void setFlavorNotes(List<String> flavorNotes) { this.flavorNotes = flavorNotes; }

    public String getBestFor() { return bestFor; }
    public void setBestFor(String bestFor) { this.bestFor = bestFor; }

    public boolean isInStock() { return inStock; }
    public void setInStock(boolean inStock) { this.inStock = inStock; }

    public boolean isSubscriptionAvailable() { return subscriptionAvailable; }
    public void setSubscriptionAvailable(boolean subscriptionAvailable) { this.subscriptionAvailable = subscriptionAvailable; }

    public String getSeoTitle() { return seoTitle; }
    public void setSeoTitle(String seoTitle) { this.seoTitle = seoTitle; }

    public String getMetaDescription() { return metaDescription; }
    public void setMetaDescription(String metaDescription) { this.metaDescription = metaDescription; }

    public String getProductDescription() { return productDescription; }
    public void setProductDescription(String productDescription) { this.productDescription = productDescription; }

    public String getMarketingHook() { return marketingHook; }
    public void setMarketingHook(String marketingHook) { this.marketingHook = marketingHook; }

    public List<String> getFeatureBullets() { return featureBullets; }
    public void setFeatureBullets(List<String> featureBullets) { this.featureBullets = featureBullets; }

    public String getPairingSuggestion() { return pairingSuggestion; }
    public void setPairingSuggestion(String pairingSuggestion) { this.pairingSuggestion = pairingSuggestion; }
}
